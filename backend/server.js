
import "dotenv/config";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { Client } from '@elastic/elasticsearch';
import path from "path";
import { authenticate, requireAdm } from './middleware/auth.js';
import bodyParser from "body-parser";
import { setupWebSocket, adminClients } from "./ws.js";
import http from "http";
console.log("Elasticsearch URL:", process.env.ELASTICSEARCH_URL);
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL
});

const app = express();

// Config
const PORT = process.env.PORT
const FRONTEND_URL = process.env.FRONTEND_URL
const JWT_SECRET = process.env.JWT_SECRET

// CORS
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL pool
const db = mysql.createPool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function reindexServices() {
  try {
    
    console.log("🔄 Reindexando serviços no Elasticsearch...");

    // Buscar todos os serviços no MySQL
    const [rows] = await db.query(`
      SELECT 
        id, user_id, type_id, type_service, name, description, picture
      FROM user_services
    `);

    // Montar corpo bulk do Elasticsearch
    const body = rows.flatMap(service => [
      { index: { _index: "services", _id: service.id.toString() } },
      service
    ]);

    if (body.length > 0) {
      await esClient.bulk({ refresh: true, body });
      console.log(`✅ Reindexados ${rows.length} serviços no Elasticsearch`);
    } else {
      console.log("ℹ️ Nenhum serviço encontrado para reindexar");
    }
  } catch (err) {
    console.error("❌ Erro ao reindexar serviços:", err);
  }
}

reindexServices();

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_services",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  }
});
const upload = multer({ storage });

// Pasta local opcional para uploads (fallback/teste)
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

// ---------- Helper: obter usuário a partir do token ----------
function getUserFromAuthHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2) return null;
  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // contém { id, username }
  } catch (err) {
    return null;
  }
}

const server = http.createServer(app); // criar servidor HTTP puro

// ---------- Rotas ----------

// Rota principal
app.get("/", (req, res) => {
  res.send("Backend API rodando");
});

// Rota de sign up para prestador de serviços
app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "username & password são obrigatórios" });

  try {
    const [existing] = await db.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existing.length > 0) return res.status(400).json({ error: "Usuário já existe" });

    const hashed = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashed]);

    res.json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    console.error("Erro no signup:", err.message);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

// Rota de sign up para clientes
app.post("/api/signup-client", async (req, res) => {
  const { client_name, password } = req.body;
  if (!client_name || !password) return res.status(400).json({ error: "client_name & password são obrigatórios" });

  try {
    const [existing] = await db.query("SELECT client_id FROM clients WHERE client_name = ?", [client_name]);
    if (existing.length > 0) return res.status(400).json({ error: "Usuário já existe" });

    const hashed = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO clients (client_name, password) VALUES (?, ?)", [client_name, hashed]);

    res.json({ message: "Cliente criado com sucesso" });
  } catch (err) {
    console.error("Erro no signup:", err.message);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "username & password são obrigatórios" });

  

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) return res.status(401).json({ error: "Credenciais inválidas" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    const token = jwt.sign({ id: user.id, username: user.username, role: 'adm' }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, userId: user.id, username: user.username, role: 'adm' });
  } catch (err) {
    console.error("Erro no login:", err.message);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

app.post("/api/login-client", async (req, res) => {
  const { client_name, password } = req.body;
  if (!client_name || !password) return res.status(400).json({ error: "client_name & password são obrigatórios" });

  try {
    const [rows] = await db.query("SELECT * FROM clients WHERE client_name = ?", [client_name]);
    if (rows.length === 0) return res.status(401).json({ error: "Credenciais inválidas" });

    const client = rows[0];
    const ok = await bcrypt.compare(password, client.password);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    const token = jwt.sign({ id: client.client_id, client_name: client.client_name, role: 'client' }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, clientId: client.client_id, client_name: client.client_name, role: 'client' });
  } catch (err) {
    console.error("Erro no login:", err.message);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

// Perfil do adm
app.get("/api/profile", async (req, res) => {
  const decoded = getUserFromAuthHeader(req);
  if (!decoded) return res.status(401).json({ error: "Token ausente ou inválido" });

  try {
    const [rows] = await db.query("SELECT id, username FROM users WHERE id = ?", [decoded.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error("Erro no profile:", err.message);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

// GET todos os servicos
app.get("/api/services", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT us.id, us.name, us.description, us.picture,
              st.type,
              u.username AS creator_name
       FROM user_services us
       JOIN services st ON us.type_id = st.id
       JOIN users u ON us.user_id = u.id
       ORDER BY us.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar serviços:", err.message);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

// GET tipos de servico
app.get("/api/service-types", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, type FROM services ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar tipos de serviço:", err.message);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

// Get servicos criados pelo usuário atual (protegido)
app.get("/api/user-services", async (req, res) => {
  const decoded = getUserFromAuthHeader(req);
  if (!decoded) return res.status(401).json({ error: "Token ausente ou inválido" });

  try {
    const [rows] = await db.query(
      `SELECT us.id, st.type, us.name, us.description, us.picture
       FROM user_services us
       JOIN services st ON us.type_id = st.id
       WHERE us.user_id = ? ORDER BY us.id DESC`,
      [decoded.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar serviços do usuário:", err.message);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

// Criar um novo servico - Com upload pra Cloudinary
app.post(
  "/api/user-services",
  authenticate,
  requireAdm,
  upload.single("picture"),
  async (req, res) => {
    const decoded = getUserFromAuthHeader(req);
    if (!decoded) return res.status(401).json({ error: "Token ausente ou inválido" });

    try {
      const { typeId, name, description = "", variations, availability } = req.body;

      if (!typeId || !name) {
        return res.status(400).json({ error: "typeId e name são obrigatórios" });
      }

      // ✅ Parse variations JSON com segurança
      let variationsArray = [];
      if (variations) {
        try {
          variationsArray = JSON.parse(variations);
          if (!Array.isArray(variationsArray)) variationsArray = [];
        } catch (err) {
          console.error("Erro ao parsear JSON de variações:", err);
          return res.status(400).json({ error: "Formato de variações inválido" });
        }
      }

      // Remover variações vazias
      variationsArray = variationsArray.map(v => v.trim()).filter(v => v !== "");
      if (variationsArray.length === 0) {
        return res.status(400).json({ error: "Pelo menos uma variação é obrigatória" });
      }

      // ✅ Parse availability
      let availabilityArray = [];
      if (availability) {
        try {
          availabilityArray = JSON.parse(availability);
          if (!Array.isArray(availabilityArray)) availabilityArray = [];
        } catch (err) {
          console.error("Erro ao parsear JSON de disponibilidade:", err);
          return res.status(400).json({ error: "Formato de disponibilidade inválido" });
        }
      }

      // ✅ Obter URL da imagem (Cloudinary, multer, etc.)
      const pictureUrl =
        (req.file &&
          (req.file.path || req.file.location || req.file.secure_url || req.file.url)) ||
        null;

      // ✅ Buscar o nome do tipo na tabela `services`
      const [typeRows] = await db.query("SELECT type FROM services WHERE id = ?", [typeId]);
      if (!typeRows.length) {
        return res.status(400).json({ error: "Tipo de serviço inválido" });
      }
      const typeName = typeRows[0].type;

      // ✅ Inserir em user_services com tipo incluído
      const [result] = await db.query(
        "INSERT INTO user_services (user_id, type_id, type_service, name, description, picture) VALUES (?, ?, ?, ?, ?, ?)",
        [decoded.id, typeId, typeName, name, description, pictureUrl]
      );

      const serviceId = result.insertId;

      // ✅ Inserir variações em `service_variations`
      for (const v of variationsArray) {
        await db.query(
          "INSERT INTO service_variations (service_id, description) VALUES (?, ?)",
          [serviceId, v]
        );
      }

      // ✅ Inserir disponibilidade
      for (const slot of availabilityArray) {
        const { date, start } = slot;
        if (date && start) {
          await db.query(
            "INSERT INTO service_availability (service_id, date, time) VALUES (?, ?, ?)",
            [serviceId, date, start]
          );
        }
      }

      // ✅ Indexar no Elasticsearch
      try {
        await esClient.index({
          index: "services",
          id: serviceId.toString(),
          body: {
            id: serviceId,
            user_id: decoded.id,
            type_id: typeId,
            type_service: typeName,
            name,
            description,
            picture: pictureUrl,
            variations: variationsArray,
          },
        });
      } catch (esErr) {
        console.warn("Erro ao indexar no Elasticsearch:", esErr.message);
      }

      res.json({
        message: "Serviço criado com sucesso",
        service: {
          id: serviceId,
          user_id: decoded.id,
          type_id: typeId,
          type: typeName,
          name,
          description,
          picture: pictureUrl,
          variations: variationsArray,
          availability: availabilityArray,
        },
      });

      console.log("Serviço criado ID:", serviceId);
    } catch (err) {
      console.error("Erro ao criar serviço:", err);
      res.status(500).json({ error: "Erro no banco de dados ou indexação" });
    }
  }
);
// deletar por id
app.delete("/api/user-services/:id", async (req, res) => {
  const decoded = getUserFromAuthHeader(req);
  if (!decoded) return res.status(401).json({ error: "Token ausente ou inválido" });

  const serviceId = req.params.id;
  try {
    // garantir que seja o dono
    const [rows] = await db.query("SELECT user_id, picture FROM user_services WHERE id = ?", [serviceId]);
    if (rows.length === 0) return res.status(404).json({ error: "Serviço não encontrado" });
    if (rows[0].user_id !== decoded.id) return res.status(403).json({ error: "Não autorizado" });

    // Opcional: remover imagem do Cloudinary (se desejar)
    // if (rows[0].picture_url && rows[0].picture_url.includes("res.cloudinary.com")) { ... }

    await db.query("DELETE FROM user_services WHERE id = ?", [serviceId]);
    res.json({ message: "Serviço deletado" });
  } catch (err) {
    console.error("Erro ao deletar serviço:", err.message);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

// rota de variacoes disponiveis
app.get("/api/services/:id/variations", async (req, res) => {
  const serviceId = req.params.id;

  try {
    const [rows] = await db.query(
      "SELECT id, description FROM service_variations WHERE service_id = ?",
      [serviceId]
    );

    res.json(rows); // [{id: 1, description: "$20, 2 dias por semana"}, ...]
  } catch (err) {
    console.error("Erro ao buscar variações do serviço:", err);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

// rota de datas disponiveis
app.get("/api/services/:id/available-dates", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT id, date, time FROM service_availability WHERE service_id = ? ORDER BY date, time",
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar datas disponíveis:", err);
    res.status(500).json({ error: "Não foi possível buscar datas disponíveis" });
  }
});

// rota de busca de servicos
app.get('/api/services/search', async (req, res) => {
  const { q, type } = req.query;
  
  try {
    const must = [];

    // Buscar por nome ou descrição
    if (q) {
      must.push({
        multi_match: {
          query: q,
          fields: ['name', 'description']
        }
      });
    }

    // Filtrar por tipo de serviço (do seletor)
    if (type) {
      must.push({
        match: { type_service: type }
      });
    }

    // Executar busca
    const esResult = await esClient.search({
      index: 'services',
      body: {
        query: must.length
          ? { bool: { must } }
          : { match_all: {} }
      },
      size: 1000
    });

    // Retornar dados completos do serviço incluindo type_service
    res.json(esResult.hits.hits.map(hit => ({
      id: hit._source.id,
      name: hit._source.name,
      description: hit._source.description,
      picture: hit._source.picture,
      user_id: hit._source.user_id,
      type_id: hit._source.type_id,
      type_service: hit._source.type_service
    })));
  } catch (err) {
    console.error("Erro na busca Elasticsearch:", err);
    res.status(500).json({ error: "Erro no Elasticsearch" });
  }
});

// deletar servicos
app.delete('/api/services/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Obter informações do serviço no DB
    const [rows] = await db.execute('SELECT picture FROM user_services WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Serviço não encontrado' });

    const imageUrl = rows[0].picture;

    // Deletar do Cloudinary se válido
    if (imageUrl && imageUrl.includes('cloudinary.com')) {
      try {
        const matches = imageUrl.match(/\/upload\/(?:v\d+\/)?([^/.]+)/);
        if (matches && matches[1]) {
          const publicId = matches[1];
          await cloudinary.uploader.destroy(publicId);
        } else {
          console.warn('Não foi possível extrair o public ID do Cloudinary a partir da URL:', imageUrl);
        }
      } catch (err) {
        console.warn('Falha ao deletar do Cloudinary:', err.message);
      }
    }

    // Deletar do MySQL
    await db.execute('DELETE FROM user_services WHERE id = ?', [id]);

    // Deletar do Elasticsearch
    try {
      await esClient.delete({
        index: 'services',
        id: id.toString(),
      });
    } catch (err) {
      console.warn('Falha ao deletar do Elasticsearch (provavelmente não indexado):', err.message);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao deletar serviço:', err);
    res.status(500).json({ error: 'Falha ao deletar serviço' });
  }
});

// criar contratos
app.post("/api/contracts", authenticate, async (req, res) => {
  const decoded = getUserFromAuthHeader(req);
  if (!decoded) return res.status(401).json({ error: "Não autorizado" });

  const { service_id, variation, datetime } = req.body;
  if (!service_id || !variation || !datetime)
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });

  try {
    // Verificar se esta combinação de data+variação já existe
    const [exists] = await db.query(
      `SELECT id FROM contracts WHERE service_id = ? AND variation = ? AND datetime = ?`,
      [service_id, variation, datetime]
    );
    if (exists.length > 0) {
      return res.status(400).json({ error: "Esta combinação de data+variação já está reservada" });
    }

    // Inserir novo contrato
    await db.query(
      `INSERT INTO contracts (client_id, service_id, variation, datetime) VALUES (?, ?, ?, ?)`,
      [decoded.id, service_id, variation, datetime]
    );

    // Buscar serviço e seu admin
    const [[service]] = await db.query(
      `SELECT user_id AS admin_id, name AS service_name
       FROM user_services
       WHERE id = ?`,
      [service_id]
    );

    // Notificar todos os admins conectados
    if (service) {
      const sockets = adminClients.get(String(service.admin_id)) || [];
      sockets.forEach(ws => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({
            serviceName: service.service_name,
            clientId: decoded.id
          }));
        }
      });
    }

    res.json({ success: true, message: "Contrato criado com sucesso" });
  } catch (err) {
    console.error("Erro ao criar contrato:", err);
    res.status(500).json({ error: "Não foi possível criar o contrato" });
  }
});

// GET contratos 
app.get("/api/contracts", authenticate, requireAdm, async (req, res) => {
  const decoded = getUserFromAuthHeader(req);
  if (!decoded) return res.status(401).json({ error: "Não autorizado" });

  try {
    const [rows] = await db.query(
      `SELECT c.id AS contract_id, c.service_id, c.client_id, c.variation, c.datetime,
              us.name AS service_name, cl.client_name
       FROM contracts c
       JOIN user_services us ON c.service_id = us.id
       JOIN clients cl ON c.client_id = cl.client_id
       WHERE us.user_id = ?
       ORDER BY c.datetime DESC`,
      [decoded.id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar contratos:", err);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

// Cancelar contrato
app.delete("/api/contracts/:id", authenticate, requireAdm, async (req, res) => {
  const decoded = getUserFromAuthHeader(req);
  if (!decoded) return res.status(401).json({ error: "Não autorizado" });

  const contractId = req.params.id;

  try {
    // Garantir que é admin e dono do serviço
    const [[contract]] = await db.query(
      `SELECT c.id, us.user_id AS admin_id
       FROM contracts c
       JOIN user_services us ON c.service_id = us.id
       WHERE c.id = ?`,
      [contractId]
    );

    if (!contract) return res.status(404).json({ error: "Contrato não encontrado" });
    if (contract.admin_id !== decoded.id) return res.status(403).json({ error: "Não autorizado" });

    await db.query("DELETE FROM contracts WHERE id = ?", [contractId]);
    res.json({ success: true, message: "Contrato cancelado com sucesso" });
  } catch (err) {
    console.error("Erro ao cancelar contrato:", err);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

// Configurar WebSocket
setupWebSocket(server, JWT_SECRET);

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
