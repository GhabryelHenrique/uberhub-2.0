# 🔄 Guia de Migração do Sistema Legado - Uber4Hub

## Migração de Dados e Setup Inicial

---

## 📋 Sumário

1. [Preparação do Ambiente](#preparação-do-ambiente)
2. [Migração de Dados](#migração-de-dados)
3. [Setup do Backend](#setup-do-backend)
4. [Setup do Frontend](#setup-do-frontend)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

---

## 1. Preparação do Ambiente

### 1.1 Requisitos de Sistema

**Desenvolvimento Local**:
- Node.js 20.x LTS
- PostgreSQL 16.x
- Redis 7.x
- Docker & Docker Compose (opcional)
- Git 2.x

**Produção**:
- Servidor Linux (Ubuntu 22.04 LTS recomendado)
- Mínimo: 2 vCPUs, 4GB RAM, 50GB SSD
- SSL Certificate (Let's Encrypt)

### 1.2 Ferramentas Necessárias

```bash
# Instalar Node.js 20 (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL 16
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install postgresql-16

# Instalar Redis
sudo apt-get install redis-server

# Instalar PM2 (para produção)
npm install -g pm2

# Instalar Prisma CLI
npm install -g prisma
```

---

## 2. Migração de Dados

### 2.1 Análise dos Dados Legados

**Fontes de Dados**:
1. ✅ **Airtable** (296 startups)
2. ✅ **Google Maps API** (338 empresas tech)
3. ✅ **Merge Categorizado** (619 organizações)

**Dados Disponíveis**:
```
✅ 619 organizações categorizadas
✅ 9 categorias do ecossistema
✅ Coordenadas geográficas (latitude/longitude)
✅ Informações de contato (phone, email, website)
✅ Ratings do Google (340 organizações)
✅ Setores e segmentos
✅ Fases de startups (validação, operação, escala)
✅ Informações de investimento
```

### 2.2 Script de Migração

**Criar arquivo**: `backend/prisma/seed.ts`

```typescript
import { PrismaClient, CategoryType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Mapeamento de categorias
const categoryMap: { [key: string]: CategoryType } = {
  'Empresas de base tecnológica': 'TECH_COMPANY',
  'Startups': 'STARTUP',
  'Coworkings, salas empresariais e espaços de inovação': 'COWORKING',
  'Polos de Tecnologia & ICT´s': 'TECH_POLE',
  'Aceleradoras, Incubadoras e ventures (VC, VB e outros)': 'ACCELERATOR',
  'Entidades/iniciativas de representação e apoio': 'SUPPORT_ENTITY',
  'Academia/Instituições de ensino': 'ACADEMY',
  'Programas de Capacitação / Formação de talentos': 'TRAINING',
  'Corporates/Grandes empresas que relacionam com ecossistema': 'CORPORATE'
};

async function main() {
  console.log('🚀 Iniciando seed do banco de dados...\n');

  // 1. Limpar dados existentes (apenas em dev)
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️  Limpando dados existentes...');
    await prisma.review.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    console.log('✅ Dados limpos\n');
  }

  // 2. Criar categorias
  console.log('📂 Criando categorias...');
  const categoriesData = [
    { name: 'Empresas de base tecnológica', emoji: '🏢', color: '#4A90E2', icon: 'building', order: 1 },
    { name: 'Startups', emoji: '🚀', color: '#FF6B6B', icon: 'rocket', order: 2 },
    { name: 'Coworkings, salas empresariais e espaços de inovação', emoji: '🏠', color: '#FFA07A', icon: 'home', order: 3 },
    { name: 'Polos de Tecnologia & ICT´s', emoji: '🏦', color: '#9B59B6', icon: 'landmark', order: 4 },
    { name: 'Aceleradoras, Incubadoras e ventures (VC, VB e outros)', emoji: '🔥', color: '#E74C3C', icon: 'fire', order: 5 },
    { name: 'Entidades/iniciativas de representação e apoio', emoji: '🤝', color: '#3498DB', icon: 'handshake', order: 6 },
    { name: 'Academia/Instituições de ensino', emoji: '📚', color: '#2ECC71', icon: 'book', order: 7 },
    { name: 'Programas de Capacitação / Formação de talentos', emoji: '👩🏻‍💻', color: '#F39C12', icon: 'laptop-code', order: 8 },
    { name: 'Corporates/Grandes empresas que relacionam com ecossistema', emoji: '👔', color: '#34495E', icon: 'briefcase', order: 9 }
  ];

  for (const cat of categoriesData) {
    await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        emoji: cat.emoji,
        color: cat.color,
        icon: cat.icon,
        order: cat.order,
        is_active: true
      }
    });
  }
  console.log(`✅ ${categoriesData.length} categorias criadas\n`);

  // 3. Importar organizações do JSON
  console.log('🏢 Importando organizações...');
  const jsonPath = path.join(__dirname, '../../src/assets/data/empresas_tech_uberlandia.json');
  const organizationsData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  let imported = 0;
  let skipped = 0;

  for (const org of organizationsData) {
    try {
      // Validar dados obrigatórios
      if (!org.name || !org.latitude || !org.longitude) {
        console.log(`⚠️  Pulando: ${org.name || 'sem nome'} - dados incompletos`);
        skipped++;
        continue;
      }

      // Mapear categoria
      const categoryEnum = categoryMap[org.categoria || ''] || 'TECH_COMPANY';

      // Criar slug único
      const baseSlug = org.name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Verificar se já existe
      let slug = baseSlug;
      let counter = 1;
      while (await prisma.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      await prisma.organization.create({
        data: {
          name: org.name,
          slug: slug,

          // Localização
          address: org.address || '',
          latitude: parseFloat(org.latitude),
          longitude: parseFloat(org.longitude),
          neighborhood: org.neighborhood || null,
          city: org.city || 'Uberlândia',
          state: org.state || 'MG',
          postal_code: org.postal_code || null,

          // Contato
          phone: org.phone || null,
          email: org.email || null,
          website: org.website || null,
          social_media: org.social_media || null,

          // Categorização
          category: categoryEnum,
          category_emoji: org.categoria_emoji || '🏢',
          sector: org.segmento_principal || org.sector || null,
          subsector: org.segmento_copy || null,

          // Informações de negócio
          description: org.description || org.solucao || null,
          solution: org.solucao || null,
          business_model: org.modelo_negocio || null,
          target_audience: org.publico_alvo || null,
          startup_phase: org.fase_atual || null,
          employees_range: org.colaboradores || null,

          // Investimento
          received_investment: org.recebeu_investimento === 'Sim' || org.recebeu_investimento === true,
          investment_amount_range: org.investment_amount_range || null,
          investor_location: org.investidor_local || null,

          // Mídia
          logo_url: org.logo_url || null,
          cover_image_url: org.cover_image_url || null,
          gallery_images: org.gallery_images || [],

          // Avaliações
          rating: org.rating ? parseFloat(org.rating) : null,
          total_ratings: org.total_ratings ? parseInt(org.total_ratings) : 0,

          // Horário
          opening_hours: org.opening_hours || null,

          // Metadados
          data_source: org.data_source || 'migration',
          is_verified: false,
          is_active: true,
          featured: false
        }
      });

      imported++;

      if (imported % 50 === 0) {
        console.log(`   Importadas: ${imported}/${organizationsData.length}`);
      }

    } catch (error) {
      console.error(`❌ Erro ao importar ${org.name}:`, error.message);
      skipped++;
    }
  }

  console.log(`\n✅ Importação concluída!`);
  console.log(`   ✅ Importadas: ${imported}`);
  console.log(`   ⚠️  Puladas: ${skipped}\n`);

  // 4. Criar usuários de teste
  console.log('👤 Criando usuários de teste...');

  const bcrypt = require('bcryptjs');

  const users = [
    {
      name: 'Super Admin',
      email: 'admin@uber4hub.com',
      password: await bcrypt.hash('Admin@123', 12),
      role: 'SUPER_ADMIN',
      is_email_verified: true
    },
    {
      name: 'Administrador',
      email: 'moderador@uber4hub.com',
      password: await bcrypt.hash('Mod@123', 12),
      role: 'ADMIN',
      is_email_verified: true
    },
    {
      name: 'Usuário Teste',
      email: 'usuario@uber4hub.com',
      password: await bcrypt.hash('User@123', 12),
      role: 'USER',
      is_email_verified: true
    }
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  console.log(`✅ ${users.length} usuários criados\n`);

  console.log('🎉 Seed concluído com sucesso!\n');

  // Estatísticas finais
  const stats = {
    organizations: await prisma.organization.count(),
    categories: await prisma.category.count(),
    users: await prisma.user.count()
  };

  console.log('📊 Estatísticas:');
  console.log(`   Organizações: ${stats.organizations}`);
  console.log(`   Categorias: ${stats.categories}`);
  console.log(`   Usuários: ${stats.users}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro durante seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

### 2.3 Executar Migração

```bash
# 1. Criar banco de dados
createdb uber4hub

# 2. Copiar JSON para pasta correta
cp src/assets/data/empresas_tech_uberlandia.json backend/src/assets/data/

# 3. Rodar migrations
cd backend
npx prisma migrate dev --name init

# 4. Executar seed
npx prisma db seed

# 5. Verificar dados
npx prisma studio
```

**Output esperado**:
```
🚀 Iniciando seed do banco de dados...

📂 Criando categorias...
✅ 9 categorias criadas

🏢 Importando organizações...
   Importadas: 50/619
   Importadas: 100/619
   ...
   Importadas: 600/619

✅ Importação concluída!
   ✅ Importadas: 615
   ⚠️  Puladas: 4

👤 Criando usuários de teste...
✅ 3 usuários criados

🎉 Seed concluído com sucesso!

📊 Estatísticas:
   Organizações: 615
   Categorias: 9
   Usuários: 3
```

---

## 3. Setup do Backend

### 3.1 Estrutura do Projeto

```bash
mkdir uber4hub-backend
cd uber4hub-backend
npm init -y
```

### 3.2 Instalação de Dependências

```bash
# Core
npm install express cors helmet compression
npm install dotenv

# Database
npm install @prisma/client
npm install prisma --save-dev

# Authentication
npm install jsonwebtoken bcryptjs
npm install @types/jsonwebtoken @types/bcryptjs --save-dev

# Validation
npm install zod joi express-validator

# File Upload
npm install multer
npm install @types/multer --save-dev

# Email
npm install nodemailer
npm install @types/nodemailer --save-dev

# Redis
npm install redis

# Logging
npm install winston

# Testing
npm install jest supertest @types/jest @types/supertest --save-dev

# TypeScript
npm install typescript ts-node @types/node @types/express --save-dev

# Utilities
npm install axios date-fns slugify
```

### 3.3 Configuração do TypeScript

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "lib": ["ES2021"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

### 3.4 Configuração do Prisma

```bash
npx prisma init
```

Copiar schema do relatório (`FASE-1-RELATORIO.md`) para `prisma/schema.prisma`

### 3.5 Variáveis de Ambiente

**.env.example**:
```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:4200
API_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://uber4hub:senha123@localhost:5432/uber4hub

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=seu-secret-super-seguro-mude-em-producao
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Google
GOOGLE_MAPS_API_KEY=sua-chave-aqui
GEMINI_API_KEY=sua-chave-aqui

# Email (SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua-api-key-sendgrid
EMAIL_FROM=noreply@uber4hub.com

# AWS S3
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=uber4hub-uploads

# Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### 3.6 Scripts do package.json

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "ts-node prisma/seed.ts",
    "prisma:studio": "prisma studio",
    "prisma:generate": "prisma generate",
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "migrate:prod": "prisma migrate deploy"
  }
}
```

---

## 4. Setup do Frontend

### 4.1 Criar Projeto Angular

```bash
npx @angular/cli@19 new uber4hub-frontend
# ✔ Standalone components? Yes
# ✔ SSR/SSG? No
# ✔ Stylesheet format? SCSS
```

### 4.2 Instalação de Dependências

```bash
cd uber4hub-frontend

# Google Maps
npm install @angular/google-maps

# Charts
npm install chart.js ng2-charts

# Utilitários
npm install date-fns

# HTTP Client (já incluído no Angular)
```

### 4.3 Configuração do Google Maps

**angular.json** - adicionar script:
```json
{
  "projects": {
    "uber4hub-frontend": {
      "architect": {
        "build": {
          "options": {
            "scripts": [
              "node_modules/chart.js/dist/chart.umd.js"
            ]
          }
        }
      }
    }
  }
}
```

**index.html** - adicionar Google Maps:
```html
<head>
  <!-- ... -->
  <script
    src="https://maps.googleapis.com/maps/api/js?key=SUA_CHAVE_AQUI&libraries=places,geometry"
    async defer>
  </script>
</head>
```

### 4.4 Variáveis de Ambiente

**src/environments/environment.ts**:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  googleMapsApiKey: 'SUA_CHAVE_AQUI',
  geminiApiKey: 'SUA_CHAVE_AQUI'
};
```

**src/environments/environment.prod.ts**:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.uber4hub.com/api',
  googleMapsApiKey: 'SUA_CHAVE_PRODUCAO',
  geminiApiKey: 'SUA_CHAVE_PRODUCAO'
};
```

---

## 5. Deployment

### 5.1 Docker Setup

**backend/Dockerfile**:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: uber4hub
      POSTGRES_USER: uber4hub
      POSTGRES_PASSWORD: senha123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://uber4hub:senha123@postgres:5432/uber4hub
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

### 5.2 Deploy em Produção

**Opção 1: DigitalOcean App Platform**

```bash
# 1. Criar conta no DigitalOcean
# 2. Conectar repositório GitHub
# 3. Configurar build command:
npm run build

# 4. Configurar run command:
npm start

# 5. Adicionar variáveis de ambiente
# 6. Deploy automático
```

**Opção 2: PM2 em VPS**

```bash
# Instalar PM2
npm install -g pm2

# Backend
cd backend
pm2 start dist/server.js --name uber4hub-api

# Frontend (servir com nginx)
cd frontend
npm run build
# Copiar dist/ para /var/www/html
```

**ecosystem.config.js** (PM2):
```javascript
module.exports = {
  apps: [{
    name: 'uber4hub-api',
    script: 'dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### 5.3 Nginx Configuration

**/etc/nginx/sites-available/uber4hub**:
```nginx
server {
    listen 80;
    server_name uber4hub.com www.uber4hub.com;

    # Frontend
    location / {
        root /var/www/uber4hub/frontend;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 6. Troubleshooting

### 6.1 Problemas Comuns

**Erro: "Cannot connect to PostgreSQL"**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar conexão
psql -U uber4hub -d uber4hub

# Resetar senha se necessário
sudo -u postgres psql
ALTER USER uber4hub WITH PASSWORD 'nova_senha';
```

**Erro: "Port 3000 already in use"**
```bash
# Encontrar processo usando a porta
lsof -i :3000

# Matar processo
kill -9 <PID>
```

**Erro: "Prisma Client not generated"**
```bash
npx prisma generate
```

**Erro: "Cannot read property of undefined (Google Maps)"**
- Verificar se a API Key está correta
- Verificar se o script do Google Maps foi carregado
- Verificar quotas da API no Google Cloud Console

**Erro: "Rate limit exceeded (Gemini API)"**
- Verificar quotas no Google AI Studio
- Implementar cache de rotas
- Adicionar fallback para algoritmo local

### 6.2 Verificação de Saúde

**Health Check Endpoint**:
```typescript
// backend/src/routes/health.ts
app.get('/health', async (req, res) => {
  try {
    // Verificar banco
    await prisma.$queryRaw`SELECT 1`;

    // Verificar Redis
    await redis.ping();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      redis: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

---

## ✅ Checklist de Migração

### Pré-Migração
- [ ] Backup do banco de dados legado
- [ ] Export de todos os dados do Airtable
- [ ] Análise de qualidade dos dados
- [ ] Documentação de campos customizados

### Setup
- [ ] Ambiente de desenvolvimento configurado
- [ ] PostgreSQL instalado e configurado
- [ ] Redis instalado
- [ ] Variáveis de ambiente configuradas
- [ ] Google Maps API Key obtida
- [ ] Gemini API Key obtida

### Migração de Dados
- [ ] Categorias criadas
- [ ] Organizações importadas (619)
- [ ] Validação de coordenadas
- [ ] Usuários de teste criados
- [ ] Verificação manual de 10 registros aleatórios

### Backend
- [ ] Prisma schema configurado
- [ ] Migrations executadas
- [ ] Seeds executados
- [ ] Testes unitários passando
- [ ] Swagger documentado

### Frontend
- [ ] Angular 19 configurado
- [ ] Google Maps carregando
- [ ] Mapa exibindo 619 organizações
- [ ] Filtros funcionando
- [ ] Rotas IA funcionando

### Deployment
- [ ] Docker configurado
- [ ] CI/CD pipeline criado
- [ ] SSL configurado
- [ ] Domínio apontando
- [ ] Monitoramento ativo
- [ ] Backups automáticos

---

**Fim do Guia de Migração**
