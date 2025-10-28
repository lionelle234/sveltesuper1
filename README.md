# Meu App

Este projeto contém frontend, backend, mysql, elasticsearch totalmente containerizados com Docker.  
Ele permite que qualquer pessoa configure e execute a aplicação localmente, usando suas próprias credenciais do Cloudinary.

---

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (WSL2 recomendado no Windows)
- Docker Compose
- Conta própria no Cloudinary
- Opcional: cliente MySQL se quiser inspecionar o banco de dados

---

## 1️⃣ Clonando o projeto

No terminal:

```bash
git clone https://github.com/lionelle234/sveltesuper1.git
cd <nome-do-repo>

2️⃣ Configuração do ambiente

Copie o arquivo de exemplo .env.example para .env na pasta backend:

cp backend/.env.example backend/.env


Abra backend/.env e preencha suas próprias credenciais:

PORT=3000
DB_HOST=db
DB_USER=root
DB_PASSWORD=root
DB_NAME=db_super
JWT_SECRET=supersecret
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret
ELASTICSEARCH_URL=http://elasticsearch:9200
FRONTEND_URL=http://localhost:5173

3️⃣ Rodando o app localmente

Na raiz do projeto, execute:

docker compose up -d --build

em /backend e /frontend:
npm install

Isso iniciará:

MySQL → container db na porta 3306

Elasticsearch → container elasticsearch na porta 9200

Kibana → container kibana na porta 5601

Backend → container backend na porta 3000

Frontend → caso não esteja containerizado, execute separadamente (npm run dev ou yarn dev) na porta 5173

Verifique se os containers estão rodando:

docker ps

4️⃣ Testando a conexão com o banco de dados

Para acessar o MySQL dentro do container:

docker exec -it db mysql -uroot -proot


Dentro do MySQL:

SHOW DATABASES;
USE db_super;
SHOW TABLES;

5️⃣ Acessando a aplicação

Backend API: http://localhost:3000

Frontend: http://localhost:5173

Elasticsearch: http://localhost:9200

Kibana: http://localhost:5601

6️⃣ Parando a aplicação

Para parar os containers:

docker compose down


Para remover todos os containers incluindo volumes:

docker compose down -v


