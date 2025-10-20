import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";


export const adminClients = new Map();

/**
 * Setup WebSocket server
 * @param {http.Server} server - raw HTTP server
 * @param {string} JWT_SECRET - secret
 */
export function setupWebSocket(server, JWT_SECRET) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket, req) => {
    // Extrair token: ws://localhost:3000?token=XYZ
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const token = urlParams.get("token");
    if (!token) return socket.close();

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error("Invalid JWT in WebSocket connection:", err.message);
      return socket.close();
    }

    // So permite adms
    if (decoded.role !== "adm") {
      console.warn("Non-admin tried to connect via WS:", decoded);
      return socket.close();
    }

    const adminId = String(decoded.id); // store as string
    const arr = adminClients.get(adminId) || [];
    arr.push(socket);
    adminClients.set(adminId, arr);
    console.log(`Admin ${adminId} connected. Total connections: ${arr.length}`);

    // Remove socket quando fecha
    socket.on("close", () => {
      const sockets = adminClients.get(adminId) || [];
      const filtered = sockets.filter(s => s !== socket);
      if (filtered.length > 0) {
        adminClients.set(adminId, filtered);
      } else {
        adminClients.delete(adminId);
      }
      console.log(`Admin ${adminId} disconnected. Remaining connections: ${filtered.length}`);
    });

    socket.on("message", (msg) => {
      console.log(`Received message from admin ${adminId}:`, msg.toString());
    });

    socket.isAlive = true;
    socket.on("pong", () => (socket.isAlive = true));
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));

  console.log("✅ WebSocket server setup complete");
}
