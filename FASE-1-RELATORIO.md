# 📋 Relatório de Implementação - Fase 1
## Uber4Hub Dashboard - Ecossistema de Inovação de Uberlândia

**Data:** Janeiro 2026
**Versão:** 1.0
**Status:** Planejamento

---

## 📑 Sumário Executivo

Este documento descreve o planejamento para a **Fase 1** do projeto Uber4Hub Dashboard, uma plataforma web para visualização e gestão do ecossistema de inovação de Uberlândia. A fase inicial foca na migração do sistema legado, criação de APIs REST completas e implementação do sistema de autenticação e autorização.

### Objetivos da Fase 1
- ✅ Migrar dados do sistema legado (Airtable) para banco de dados próprio
- ✅ Criar backend com APIs REST completas
- ✅ Implementar sistema de autenticação e autorização
- ✅ Desenvolver funcionalidades core do frontend
- ✅ Estabelecer infraestrutura de deployment

### Métricas de Sucesso
- **619 organizações** migradas e categorizadas
- **9 categorias** do ecossistema mapeadas
- **APIs RESTful** com documentação completa
- **Sistema de usuários** multi-perfil funcional
- **Taxa de uptime** > 99%

---

## 🏗️ Arquitetura do Sistema

### Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular 19)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Dashboard │  │  Mapa    │  │ Startups │  │ Usuários│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/HTTPS (REST API)
┌──────────────────────▼──────────────────────────────────┐
│              BACKEND (Node.js + Express)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Auth API  │  │Orgs API  │  │Users API │  │Maps API │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              BANCO DE DADOS (PostgreSQL)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Users   │  │  Orgs    │  │Categories│  │ Reviews │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

#### Frontend
- **Framework**: Angular 19 (standalone components)
- **UI/UX**: SCSS com variáveis CSS (dark/light theme)
- **Mapas**: Google Maps API
- **Gráficos**: Chart.js / D3.js
- **IA**: Google Gemini API (rotas inteligentes)
- **HTTP Client**: HttpClient do Angular
- **State Management**: RxJS + Services

#### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js 4.x
- **ORM**: Prisma 5.x
- **Autenticação**: JWT (jsonwebtoken)
- **Validação**: Zod / Joi
- **Upload**: Multer (imagens/logos)
- **Email**: Nodemailer
- **Logs**: Winston

#### Banco de Dados
- **Principal**: PostgreSQL 16
- **Cache**: Redis 7.x (sessões, cache de queries)
- **Storage**: AWS S3 / MinIO (imagens)

#### DevOps
- **Containerização**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: AWS / DigitalOcean / Vercel
- **Monitoramento**: PM2 + CloudWatch

---

## 🎯 Features da Fase 1

### 1. Sistema de Autenticação e Autorização

#### 1.1 Cadastro de Usuários
**Prioridade**: 🔴 Alta

**Funcionalidades**:
- Cadastro com email/senha
- Validação de email (envio de link de confirmação)
- Campos: nome, email, senha, telefone, organização, cargo
- Validação de senha forte (mínimo 8 caracteres, maiúsculas, números, especiais)
- Captcha para prevenir bots

**Endpoints**:
```http
POST /api/auth/register
POST /api/auth/verify-email/:token
POST /api/auth/resend-verification
```

**Modelo de Dados**:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  organization_id?: string;
  role: 'user' | 'admin' | 'super_admin' | 'organization_manager';
  is_email_verified: boolean;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}
```

#### 1.2 Login e Sessões
**Prioridade**: 🔴 Alta

**Funcionalidades**:
- Login com email/senha
- Geração de JWT (access token + refresh token)
- Logout (invalidação de tokens)
- "Lembrar-me" (refresh token de longa duração)
- Bloqueio após 5 tentativas falhas (15 minutos)

**Endpoints**:
```http
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
GET  /api/auth/me
```

#### 1.3 Recuperação de Senha
**Prioridade**: 🟡 Média

**Funcionalidades**:
- Solicitação de reset via email
- Envio de link com token temporário (válido por 1 hora)
- Página de reset de senha
- Histórico de senhas (não permitir reutilização das últimas 3)

**Endpoints**:
```http
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token
```

#### 1.4 Perfis de Usuário
**Prioridade**: 🟡 Média

**Perfis Definidos**:

| Perfil | Permissões |
|--------|------------|
| **User** | - Visualizar organizações<br>- Filtrar e buscar<br>- Visualizar mapa<br>- Usar rotas IA |
| **Organization Manager** | - Tudo do User<br>- Editar dados da própria organização<br>- Adicionar/remover fotos<br>- Responder avaliações |
| **Admin** | - Tudo do Organization Manager<br>- Aprovar/rejeitar organizações<br>- Editar categorias<br>- Moderar conteúdo |
| **Super Admin** | - Acesso total<br>- Gerenciar usuários<br>- Configurações do sistema<br>- Logs e analytics |

---

### 2. CRUD de Organizações

#### 2.1 Listagem e Busca
**Prioridade**: 🔴 Alta

**Funcionalidades**:
- Listagem paginada (25 itens por página)
- Busca por nome, setor, categoria
- Filtros múltiplos:
  - Categoria do ecossistema (9 categorias)
  - Setor de atuação
  - Fase da startup (validação, operação, escala)
  - Localização (bairro/região)
  - Avaliação (1-5 estrelas)
- Ordenação (nome, data cadastro, avaliação)
- Export para CSV/Excel

**Endpoints**:
```http
GET /api/organizations?page=1&limit=25&search=tech&category=startups
GET /api/organizations/:id
GET /api/organizations/export?format=csv
```

**Modelo de Dados**:
```typescript
interface Organization {
  id: string;
  name: string;
  slug: string;

  // Localização
  address: string;
  latitude: number;
  longitude: number;
  neighborhood?: string;
  city: string;
  state: string;
  postal_code?: string;

  // Contato
  phone?: string;
  email?: string;
  website?: string;
  social_media?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };

  // Categorização
  category: CategoryEnum;
  category_emoji: string;
  sector?: string;
  subsector?: string;

  // Informações de negócio
  description?: string;
  solution?: string;
  business_model?: string;
  target_audience?: string;
  startup_phase?: string;
  employees_range?: string;

  // Investimento
  received_investment: boolean;
  investment_amount_range?: string;
  investor_location?: string;

  // Mídia
  logo_url?: string;
  cover_image_url?: string;
  gallery_images?: string[];

  // Avaliações
  rating?: number;
  total_ratings: number;

  // Horário de funcionamento
  opening_hours?: string;

  // Metadados
  data_source: string;
  is_verified: boolean;
  is_active: boolean;
  featured: boolean;

  // Relacionamentos
  owner_user_id?: string;
  manager_user_ids: string[];

  created_at: Date;
  updated_at: Date;
}

enum CategoryEnum {
  TECH_COMPANY = 'Empresas de base tecnológica',
  STARTUP = 'Startups',
  COWORKING = 'Coworkings, salas empresariais e espaços de inovação',
  TECH_POLE = 'Polos de Tecnologia & ICT´s',
  ACCELERATOR = 'Aceleradoras, Incubadoras e ventures (VC, VB e outros)',
  SUPPORT_ENTITY = 'Entidades/iniciativas de representação e apoio',
  ACADEMY = 'Academia/Instituições de ensino',
  TRAINING = 'Programas de Capacitação / Formação de talentos',
  CORPORATE = 'Corporates/Grandes empresas que relacionam com ecossistema'
}
```

#### 2.2 Criação de Organizações
**Prioridade**: 🔴 Alta

**Funcionalidades**:
- Formulário multi-step:
  1. Informações básicas (nome, categoria, setor)
  2. Localização (endereço com autocomplete Google Maps)
  3. Contato (telefone, email, site, redes sociais)
  4. Detalhes do negócio (descrição, modelo, fase)
  5. Mídia (logo, cover, galeria)
- Validação de dados duplicados (mesmo nome/endereço)
- Upload de imagens (max 5MB, formatos: jpg, png, webp)
- Aprovação por Admin (status: pending, approved, rejected)
- Geocoding automático do endereço

**Endpoints**:
```http
POST /api/organizations
POST /api/organizations/:id/upload-logo
POST /api/organizations/:id/upload-gallery
```

#### 2.3 Edição de Organizações
**Prioridade**: 🟡 Média

**Funcionalidades**:
- Edição completa de dados (apenas owner/manager/admin)
- Histórico de alterações (audit log)
- Validação de mudanças sensíveis (categoria, localização)
- Atualização de coordenadas ao mudar endereço

**Endpoints**:
```http
PUT   /api/organizations/:id
PATCH /api/organizations/:id
GET   /api/organizations/:id/history
```

#### 2.4 Remoção de Organizações
**Prioridade**: 🟢 Baixa

**Funcionalidades**:
- Soft delete (marca como inativo ao invés de deletar)
- Apenas Super Admin pode deletar permanentemente
- Confirmação com senha do usuário

**Endpoints**:
```http
DELETE /api/organizations/:id
POST   /api/organizations/:id/restore
DELETE /api/organizations/:id/permanent (super admin only)
```

---

### 3. Mapa Interativo

#### 3.1 Visualização de Mapa
**Prioridade**: 🔴 Alta

**Funcionalidades**:
- Google Maps com marcadores customizados
- Cores por categoria (9 cores diferentes)
- InfoWindow com dados resumidos:
  - Logo/nome
  - Categoria com emoji
  - Setor
  - Rating
  - Botões: Ver detalhes, Site, Telefone
- Clustering de marcadores (quando muitos próximos)
- Zoom automático para área com organizações

**Endpoints**:
```http
GET /api/organizations/map?bounds=lat1,lng1,lat2,lng2&categories=startup,tech
```

#### 3.2 Filtros de Mapa
**Prioridade**: 🔴 Alta

**Funcionalidades**:
- Filtro multi-select por categoria (checkboxes)
- Filtro multi-select por setor
- Busca por nome
- Legenda de cores com contadores
- "Resetar filtros"
- Persistência de filtros (localStorage)

#### 3.3 Rotas Inteligentes com IA
**Prioridade**: 🟡 Média

**Funcionalidades**:
- Integração com Google Gemini API
- 2 modos:
  1. **Configuração manual**: prioridade (distância/setor/fase), número de paradas
  2. **Chat IA**: prompt em linguagem natural
- Geração de rota otimizada
- Exibição no mapa com DirectionsRenderer
- Informações da rota:
  - Distância total
  - Tempo estimado
  - Destaques da rota
  - Sequência de visitas com justificativas
- Salvar rotas (usuário logado)

**Endpoints**:
```http
POST /api/routes/generate
  Body: { criteria: {}, startups: [] }

POST /api/routes/generate-from-prompt
  Body: { prompt: string, startups: [] }

POST /api/routes/save
  Body: { route: {}, name: string }

GET /api/routes/my-routes
```

---

### 4. Dashboard e Analytics

#### 4.1 Dashboard Principal
**Prioridade**: 🟡 Média

**Funcionalidades**:
- Cards de estatísticas:
  - Total de organizações
  - Total por categoria
  - Novas organizações (últimos 30 dias)
  - Total de usuários cadastrados
- Gráficos:
  - Distribuição por categoria (pie chart)
  - Distribuição por setor (treemap)
  - Crescimento mensal (line chart)
  - Top 10 setores (bar chart)
- Tabela de organizações recentes
- Filtro por período (7 dias, 30 dias, 6 meses, 1 ano)

**Endpoints**:
```http
GET /api/analytics/overview
GET /api/analytics/by-category
GET /api/analytics/by-sector
GET /api/analytics/growth?period=30d
```

#### 4.2 Página de Startups
**Prioridade**: 🟡 Média

**Funcionalidades**:
- Grid view / List view
- Cards com:
  - Logo
  - Nome
  - Setor
  - Categoria
  - Rating
  - Localização
  - Botão "Ver detalhes"
- Paginação infinita (scroll)
- Skeleton loading

---

### 5. Sistema de Avaliações e Reviews

#### 5.1 Avaliações
**Prioridade**: 🟢 Baixa (Fase 1.5)

**Funcionalidades**:
- Apenas usuários logados podem avaliar
- Rating de 1 a 5 estrelas
- Comentário opcional
- Não pode avaliar a própria organização
- Limite de 1 avaliação por usuário por organização
- Editar/deletar própria avaliação

**Modelo de Dados**:
```typescript
interface Review {
  id: string;
  organization_id: string;
  user_id: string;
  rating: number; // 1-5
  comment?: string;
  is_verified_visit: boolean;
  helpful_count: number;
  created_at: Date;
  updated_at: Date;
}
```

**Endpoints**:
```http
POST   /api/organizations/:id/reviews
GET    /api/organizations/:id/reviews
PUT    /api/reviews/:id
DELETE /api/reviews/:id
POST   /api/reviews/:id/helpful
```

---

### 6. Gestão de Categorias

#### 6.1 CRUD de Categorias
**Prioridade**: 🟢 Baixa (apenas Admin)

**Funcionalidades**:
- Listar categorias
- Criar nova categoria
- Editar categoria (nome, emoji, cor, ícone)
- Desativar categoria (não pode deletar se houver organizações)
- Reordenar categorias

**Endpoints**:
```http
GET    /api/categories
POST   /api/categories (admin)
PUT    /api/categories/:id (admin)
DELETE /api/categories/:id (admin)
```

---

## 🔌 Arquitetura de APIs

### Estrutura de Pastas do Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── jwt.ts
│   │   └── env.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── error.middleware.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validators.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.routes.ts
│   │   │   └── users.validators.ts
│   │   ├── organizations/
│   │   │   ├── organizations.controller.ts
│   │   │   ├── organizations.service.ts
│   │   │   ├── organizations.routes.ts
│   │   │   └── organizations.validators.ts
│   │   ├── categories/
│   │   ├── reviews/
│   │   ├── routes/
│   │   └── analytics/
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── email.ts
│   │   ├── geocoding.ts
│   │   └── validators.ts
│   ├── types/
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── app.ts
│   └── server.ts
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
└── tsconfig.json
```

### Padrões de API

#### Autenticação
Todas as rotas protegidas requerem header:
```http
Authorization: Bearer <JWT_TOKEN>
```

#### Respostas Padronizadas

**Sucesso**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso",
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 619,
    "totalPages": 25
  }
}
```

**Erro**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email já cadastrado",
    "details": [
      {
        "field": "email",
        "message": "Este email já está em uso"
      }
    ]
  }
}
```

#### Códigos de Status HTTP

| Código | Uso |
|--------|-----|
| 200 | Sucesso (GET, PUT) |
| 201 | Criado (POST) |
| 204 | Sem conteúdo (DELETE) |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Não encontrado |
| 409 | Conflito (duplicação) |
| 422 | Entidade não processável (validação) |
| 500 | Erro do servidor |

---

## 🗄️ Estrutura do Banco de Dados

### Schema Prisma

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============ USUÁRIOS ============

model User {
  id                String    @id @default(uuid())
  name              String
  email             String    @unique
  password_hash     String
  phone             String?
  role              Role      @default(USER)
  is_email_verified Boolean   @default(false)
  avatar_url        String?

  // Relacionamentos
  organization_id   String?
  organization      Organization? @relation("OrganizationOwner", fields: [organization_id], references: [id])
  managed_orgs      Organization[] @relation("OrganizationManagers")
  reviews           Review[]
  saved_routes      SavedRoute[]

  // Timestamps
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  last_login        DateTime?

  @@map("users")
}

enum Role {
  USER
  ORGANIZATION_MANAGER
  ADMIN
  SUPER_ADMIN
}

// ============ ORGANIZAÇÕES ============

model Organization {
  id                String    @id @default(uuid())
  name              String
  slug              String    @unique

  // Localização
  address           String
  latitude          Float
  longitude         Float
  neighborhood      String?
  city              String    @default("Uberlândia")
  state             String    @default("MG")
  postal_code       String?

  // Contato
  phone             String?
  email             String?
  website           String?
  social_media      Json?

  // Categorização
  category          CategoryType
  category_emoji    String
  sector            String?
  subsector         String?

  // Informações de negócio
  description       String?   @db.Text
  solution          String?   @db.Text
  business_model    String?
  target_audience   String?
  startup_phase     String?
  employees_range   String?

  // Investimento
  received_investment      Boolean @default(false)
  investment_amount_range  String?
  investor_location        String?

  // Mídia
  logo_url          String?
  cover_image_url   String?
  gallery_images    String[]

  // Avaliações
  rating            Float?
  total_ratings     Int       @default(0)

  // Horário
  opening_hours     String?

  // Metadados
  data_source       String    @default("manual")
  is_verified       Boolean   @default(false)
  is_active         Boolean   @default(true)
  featured          Boolean   @default(false)

  // Relacionamentos
  owner_user_id     String?
  owner             User?     @relation("OrganizationOwner", fields: [owner_user_id], references: [id])
  managers          User[]    @relation("OrganizationManagers")
  reviews           Review[]

  // Timestamps
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt

  @@map("organizations")
  @@index([category])
  @@index([sector])
  @@index([latitude, longitude])
  @@index([is_active])
}

enum CategoryType {
  TECH_COMPANY
  STARTUP
  COWORKING
  TECH_POLE
  ACCELERATOR
  SUPPORT_ENTITY
  ACADEMY
  TRAINING
  CORPORATE
}

// ============ CATEGORIAS ============

model Category {
  id              String    @id @default(uuid())
  name            String    @unique
  slug            String    @unique
  emoji           String
  color           String
  icon            String
  description     String?
  order           Int       @default(0)
  is_active       Boolean   @default(true)

  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  @@map("categories")
}

// ============ AVALIAÇÕES ============

model Review {
  id                 String    @id @default(uuid())
  organization_id    String
  organization       Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user_id            String
  user               User      @relation(fields: [user_id], references: [id], onDelete: Cascade)

  rating             Int       // 1-5
  comment            String?   @db.Text
  is_verified_visit  Boolean   @default(false)
  helpful_count      Int       @default(0)

  created_at         DateTime  @default(now())
  updated_at         DateTime  @updatedAt

  @@map("reviews")
  @@unique([organization_id, user_id])
  @@index([organization_id])
  @@index([user_id])
}

// ============ ROTAS SALVAS ============

model SavedRoute {
  id              String    @id @default(uuid())
  user_id         String
  user            User      @relation(fields: [user_id], references: [id], onDelete: Cascade)

  name            String
  description     String?
  route_data      Json      // Dados completos da rota
  organization_ids String[]  // IDs das organizações na rota

  total_distance  String?
  estimated_time  String?

  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  @@map("saved_routes")
  @@index([user_id])
}

// ============ LOGS DE AUDITORIA ============

model AuditLog {
  id              String    @id @default(uuid())
  user_id         String?
  action          String    // CREATE, UPDATE, DELETE
  entity_type     String    // Organization, User, etc
  entity_id       String
  changes         Json?     // Antes e depois
  ip_address      String?
  user_agent      String?

  created_at      DateTime  @default(now())

  @@map("audit_logs")
  @@index([entity_type, entity_id])
  @@index([user_id])
  @@index([created_at])
}
```

### Migrations

**Estratégia de Migração do Legado**:

1. **Seed inicial**:
   - Script para importar 619 organizações do JSON categorizado
   - Validação de dados antes de importar
   - Geocoding de endereços sem coordenadas

2. **Dados de teste**:
   - 3 usuários de exemplo (user, admin, super admin)
   - 20 reviews de exemplo

**Comando de seed**:
```bash
npm run prisma:seed
```

---

## 📊 Endpoints Completos - Fase 1

### Auth Module

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Registrar novo usuário | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| POST | `/api/auth/logout` | Logout | ✅ |
| POST | `/api/auth/refresh-token` | Renovar token | ❌ |
| GET | `/api/auth/me` | Dados do usuário logado | ✅ |
| POST | `/api/auth/verify-email/:token` | Verificar email | ❌ |
| POST | `/api/auth/resend-verification` | Reenviar email de verificação | ✅ |
| POST | `/api/auth/forgot-password` | Solicitar reset de senha | ❌ |
| POST | `/api/auth/reset-password/:token` | Resetar senha | ❌ |
| PUT | `/api/auth/change-password` | Mudar senha (logado) | ✅ |

### Users Module

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/api/users` | Listar usuários | ✅ | Admin |
| GET | `/api/users/:id` | Buscar usuário | ✅ | Admin ou próprio |
| PUT | `/api/users/:id` | Atualizar usuário | ✅ | Admin ou próprio |
| DELETE | `/api/users/:id` | Deletar usuário | ✅ | Super Admin |
| POST | `/api/users/:id/upload-avatar` | Upload avatar | ✅ | Próprio |
| PATCH | `/api/users/:id/role` | Mudar role | ✅ | Super Admin |

### Organizations Module

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/api/organizations` | Listar organizações | ❌ | - |
| GET | `/api/organizations/:id` | Buscar organização | ❌ | - |
| POST | `/api/organizations` | Criar organização | ✅ | Any |
| PUT | `/api/organizations/:id` | Atualizar organização | ✅ | Manager/Admin |
| DELETE | `/api/organizations/:id` | Deletar organização | ✅ | Admin |
| POST | `/api/organizations/:id/upload-logo` | Upload logo | ✅ | Manager/Admin |
| POST | `/api/organizations/:id/upload-gallery` | Upload galeria | ✅ | Manager/Admin |
| DELETE | `/api/organizations/:id/gallery/:imageId` | Deletar imagem | ✅ | Manager/Admin |
| GET | `/api/organizations/map` | Organizações para mapa | ❌ | - |
| GET | `/api/organizations/export` | Exportar CSV/Excel | ✅ | Admin |
| GET | `/api/organizations/:id/history` | Histórico de alterações | ✅ | Admin |
| PATCH | `/api/organizations/:id/verify` | Verificar organização | ✅ | Admin |
| PATCH | `/api/organizations/:id/feature` | Destacar organização | ✅ | Admin |

### Categories Module

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/api/categories` | Listar categorias | ❌ | - |
| GET | `/api/categories/:id` | Buscar categoria | ❌ | - |
| POST | `/api/categories` | Criar categoria | ✅ | Admin |
| PUT | `/api/categories/:id` | Atualizar categoria | ✅ | Admin |
| DELETE | `/api/categories/:id` | Deletar categoria | ✅ | Admin |
| PATCH | `/api/categories/reorder` | Reordenar categorias | ✅ | Admin |

### Reviews Module

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/api/organizations/:id/reviews` | Listar reviews | ❌ | - |
| POST | `/api/organizations/:id/reviews` | Criar review | ✅ | User |
| PUT | `/api/reviews/:id` | Atualizar review | ✅ | Próprio |
| DELETE | `/api/reviews/:id` | Deletar review | ✅ | Próprio/Admin |
| POST | `/api/reviews/:id/helpful` | Marcar como útil | ✅ | User |

### Routes Module (IA)

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| POST | `/api/routes/generate` | Gerar rota (config manual) | ❌ | - |
| POST | `/api/routes/generate-from-prompt` | Gerar rota (chat IA) | ❌ | - |
| POST | `/api/routes/save` | Salvar rota | ✅ | User |
| GET | `/api/routes/my-routes` | Minhas rotas salvas | ✅ | User |
| DELETE | `/api/routes/:id` | Deletar rota salva | ✅ | Próprio |

### Analytics Module

| Método | Endpoint | Descrição | Auth | Role |
|--------|----------|-----------|------|------|
| GET | `/api/analytics/overview` | Visão geral | ❌ | - |
| GET | `/api/analytics/by-category` | Por categoria | ❌ | - |
| GET | `/api/analytics/by-sector` | Por setor | ❌ | - |
| GET | `/api/analytics/growth` | Crescimento | ❌ | - |
| GET | `/api/analytics/admin/dashboard` | Dashboard admin | ✅ | Admin |

---

## 🚀 Plano de Desenvolvimento

### Semana 1-2: Infraestrutura e Setup
**Objetivos**:
- ✅ Setup do projeto backend (Node.js + Express + Prisma)
- ✅ Setup do projeto frontend (Angular 19)
- ✅ Configuração de Docker/Docker Compose
- ✅ Setup de banco de dados PostgreSQL + Redis
- ✅ CI/CD com GitHub Actions
- ✅ Ambiente de desenvolvimento, staging e produção

**Entregáveis**:
- Repositórios configurados
- Pipelines de CI/CD funcionando
- Ambientes deployados

### Semana 3-4: Autenticação e Usuários
**Objetivos**:
- ✅ Implementar Auth Module (register, login, JWT)
- ✅ Implementar Users Module (CRUD)
- ✅ Sistema de roles e permissões
- ✅ Recuperação de senha
- ✅ Upload de avatar

**Entregáveis**:
- APIs de autenticação completas
- Testes unitários e de integração
- Documentação Swagger

### Semana 5-7: CRUD de Organizações
**Objetivos**:
- ✅ Migração de dados do legado (seed)
- ✅ Organizations Module (CRUD completo)
- ✅ Upload de imagens (logo, cover, gallery)
- ✅ Geocoding de endereços
- ✅ Sistema de aprovação (workflow)

**Entregáveis**:
- 619 organizações migradas
- APIs de organizações completas
- Sistema de aprovação funcional

### Semana 8-9: Mapa Interativo
**Objetivos**:
- ✅ Integração com Google Maps API
- ✅ Marcadores customizados por categoria
- ✅ InfoWindow com dados
- ✅ Filtros multi-select
- ✅ Clustering de marcadores

**Entregáveis**:
- Mapa funcional com todas as organizações
- Filtros funcionando
- Performance otimizada

### Semana 10-11: Rotas Inteligentes (IA)
**Objetivos**:
- ✅ Integração com Google Gemini API
- ✅ Routes Module (geração de rotas)
- ✅ Chat IA para prompts
- ✅ Salvamento de rotas (usuários logados)
- ✅ DirectionsRenderer no mapa

**Entregáveis**:
- Sistema de rotas IA funcional
- 2 modos (config manual + chat)
- Rotas salvas no banco

### Semana 12: Dashboard e Analytics
**Objetivos**:
- ✅ Analytics Module
- ✅ Dashboard principal com gráficos
- ✅ Página de startups com grid/list view
- ✅ Filtros e busca

**Entregáveis**:
- Dashboard completo
- Gráficos interativos
- Performance otimizada

### Semana 13-14: Testes, Refinamento e Deploy
**Objetivos**:
- ✅ Testes end-to-end
- ✅ Correção de bugs
- ✅ Otimização de performance
- ✅ Deploy em produção
- ✅ Documentação final

**Entregáveis**:
- Sistema em produção
- Documentação completa
- Guia de uso para usuários

---

## 🎨 UI/UX - Fase 1

### Páginas Principais

1. **Login/Registro**
   - Design limpo e moderno
   - Formulários com validação em tempo real
   - Social login (opcional - Fase 2)

2. **Dashboard**
   - Cards de estatísticas
   - Gráficos interativos
   - Tabela de organizações recentes

3. **Mapa de Inovação**
   - Google Maps fullscreen
   - Painel lateral com filtros
   - InfoWindow customizada
   - Painel de rotas IA (slide-in)

4. **Startups/Organizações**
   - Grid view com cards
   - List view com linhas
   - Filtros e busca
   - Paginação infinita

5. **Perfil de Organização**
   - Hero section (cover + logo)
   - Informações completas
   - Galeria de imagens
   - Mapa de localização
   - Reviews e avaliações

6. **Perfil de Usuário**
   - Edição de dados
   - Upload de avatar
   - Rotas salvas
   - Histórico de atividades

7. **Admin Panel**
   - Aprovação de organizações
   - Gestão de usuários
   - Gestão de categorias
   - Logs de auditoria

### Design System

**Cores**:
- Primary: `#6200ea` (roxo)
- Secondary: `#4A90E2` (azul)
- Success: `#2ECC71` (verde)
- Warning: `#F39C12` (laranja)
- Danger: `#E74C3C` (vermelho)
- Dark: `#1a1a1a`
- Light: `#f8f9fa`

**Categorias** (mesmas definidas no merge):
- 🏢 Empresas: `#4A90E2`
- 🚀 Startups: `#FF6B6B`
- 🏠 Coworkings: `#FFA07A`
- 🏦 Polos: `#9B59B6`
- 🔥 Aceleradoras: `#E74C3C`
- 🤝 Entidades: `#3498DB`
- 📚 Academia: `#2ECC71`
- 👩🏻‍💻 Capacitação: `#F39C12`
- 👔 Corporates: `#34495E`

**Tipografia**:
- Headings: Inter, 600-700
- Body: Inter, 400-500
- Monospace: Fira Code

---

## 🔒 Segurança

### Medidas de Segurança - Fase 1

1. **Autenticação**:
   - Senhas hashadas com bcrypt (12 rounds)
   - JWT com expiração (access: 1h, refresh: 7d)
   - Refresh tokens armazenados em httpOnly cookies
   - Validação de email obrigatória

2. **Autorização**:
   - Middleware de autenticação em todas as rotas protegidas
   - RBAC (Role-Based Access Control)
   - Validação de ownership em edições

3. **Proteção de Dados**:
   - HTTPS obrigatório em produção
   - Headers de segurança (Helmet.js)
   - CORS configurado
   - Rate limiting (100 req/15min por IP)
   - SQL injection prevenido (Prisma ORM)
   - XSS prevenido (validação e sanitização)

4. **Upload de Arquivos**:
   - Validação de tipo de arquivo
   - Limite de tamanho (5MB)
   - Scan de malware (ClamAV - opcional)
   - Armazenamento em S3/MinIO

5. **Logs e Auditoria**:
   - Winston para logging estruturado
   - Audit log de ações sensíveis
   - Monitoramento de tentativas de login falhadas
   - IP e user agent registrados

---

## 📈 Performance e Escalabilidade

### Otimizações - Fase 1

1. **Backend**:
   - Caching com Redis:
     - Lista de organizações (5 min)
     - Analytics (15 min)
     - Categorias (1 hora)
   - Paginação em todas as listagens
   - Índices no banco de dados
   - Query optimization (Prisma)
   - Compressão de resposta (gzip)

2. **Frontend**:
   - Lazy loading de rotas
   - Virtual scrolling em listas longas
   - Debounce em buscas (300ms)
   - Memoização de componentes
   - Service workers para cache
   - Optimistic UI updates

3. **Imagens**:
   - Resize automático no upload
   - Formato WebP
   - CDN (CloudFlare/AWS CloudFront)
   - Lazy loading de imagens

4. **Mapa**:
   - Clustering de marcadores
   - Carregamento sob demanda (bounds)
   - Throttle em eventos de zoom/pan

---

## 🧪 Testes

### Estratégia de Testes

1. **Testes Unitários** (>80% coverage):
   - Jest para backend
   - Jasmine/Karma para frontend
   - Testes de services, controllers e utils

2. **Testes de Integração**:
   - Supertest para APIs
   - Banco de dados de teste (Docker)
   - Testes de autenticação e autorização

3. **Testes E2E**:
   - Cypress para frontend
   - Testes de fluxos críticos:
     - Registro e login
     - Criação de organização
     - Geração de rotas IA

4. **Testes de Performance**:
   - K6 para load testing
   - Lighthouse para performance web

---

## 📝 Documentação

### Documentação Obrigatória

1. **API Documentation**:
   - Swagger/OpenAPI
   - Exemplos de requisições
   - Códigos de erro

2. **README.md**:
   - Setup do projeto
   - Variáveis de ambiente
   - Comandos úteis

3. **Guia de Desenvolvimento**:
   - Padrões de código
   - Git workflow
   - Code review checklist

4. **Guia de Deploy**:
   - Processo de deploy
   - Rollback
   - Troubleshooting

5. **Guia de Usuário**:
   - Como usar o sistema
   - FAQ
   - Tutoriais em vídeo (opcional)

---

## 💰 Estimativas de Custo (Mensal)

### Infraestrutura

| Serviço | Tier | Custo Estimado |
|---------|------|----------------|
| **Hosting** (DigitalOcean) | 2 vCPUs, 4GB RAM | $24/mês |
| **Banco de Dados** (PostgreSQL) | Managed, 1GB | $15/mês |
| **Redis** (Cache) | 256MB | $10/mês |
| **Storage** (S3/Spaces) | 50GB | $5/mês |
| **CDN** (CloudFlare) | Free tier | $0 |
| **Email** (SendGrid) | 40k emails/mês | $20/mês |
| **Google Maps API** | 10k requests/mês | $20/mês |
| **Google Gemini API** | 1k requests/mês | $10/mês |
| **Monitoramento** (Sentry) | Free tier | $0 |
| **SSL** (Let's Encrypt) | Free | $0 |

**Total Estimado**: ~$104/mês

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Atraso na migração de dados** | Média | Alto | - Começar migração cedo<br>- Script automatizado<br>- Validação rigorosa |
| **Problemas com Google Maps API** | Baixa | Médio | - Backup com Leaflet/OSM<br>- Monitorar quotas |
| **Gemini API indisponível** | Baixa | Baixo | - Fallback para algoritmo local<br>- Cache de rotas |
| **Escalabilidade de banco** | Média | Alto | - Índices otimizados<br>- Redis cache<br>- Monitoring |
| **Segurança (vazamento de dados)** | Baixa | Crítico | - Security audit<br>- Penetration testing<br>- Logs de auditoria |

---

## 📅 Cronograma Resumido

```mermaid
gantt
    title Fase 1 - Cronograma de Desenvolvimento
    dateFormat  YYYY-MM-DD
    section Infraestrutura
    Setup Backend & Frontend       :a1, 2026-01-06, 14d
    section Autenticação
    Auth Module                     :a2, 2026-01-20, 14d
    section Organizações
    Organizations CRUD              :a3, 2026-02-03, 21d
    section Mapa
    Mapa Interativo                 :a4, 2026-02-24, 14d
    section IA
    Rotas Inteligentes              :a5, 2026-03-10, 14d
    section Dashboard
    Dashboard & Analytics           :a6, 2026-03-24, 7d
    section Finalização
    Testes & Deploy                 :a7, 2026-03-31, 14d
```

**Duração Total**: 14 semanas (~3.5 meses)

---

## 🎯 Critérios de Aceite - Fase 1

### Funcionalidades Core
- ✅ 619 organizações migradas e acessíveis
- ✅ Sistema de autenticação funcional (JWT)
- ✅ 4 perfis de usuário implementados
- ✅ CRUD completo de organizações
- ✅ Mapa interativo com 9 categorias
- ✅ Filtros multi-select funcionando
- ✅ Rotas IA com 2 modos (config + chat)
- ✅ Dashboard com analytics

### Performance
- ✅ Tempo de carregamento < 3s
- ✅ API responde em < 500ms (p95)
- ✅ Mapa renderiza < 2s com 619 pins

### Segurança
- ✅ Todas as senhas hashadas
- ✅ JWT com expiração
- ✅ Validação de inputs
- ✅ Rate limiting ativo
- ✅ HTTPS em produção

### Testes
- ✅ Coverage > 80% (backend)
- ✅ Testes E2E nos fluxos críticos
- ✅ Sem erros críticos no Lighthouse

### Documentação
- ✅ Swagger completo
- ✅ README atualizado
- ✅ Guia de deploy

---

## 🔮 Próximas Fases (Roadmap)

### Fase 2: Features Avançadas (Q2 2026)
- Sistema de eventos e notícias
- Vagas de emprego
- Sistema de matchmaking (conexões)
- Chat/Mensagens entre usuários
- Social login (Google, LinkedIn)
- Notificações push

### Fase 3: Mobile (Q3 2026)
- App nativo (React Native)
- Offline-first
- Geolocalização em tempo real
- QR Code para check-in

### Fase 4: Analytics Avançado (Q4 2026)
- BI Dashboard
- Relatórios customizados
- Export de dados avançado
- Machine learning para insights

---

## 📞 Contatos e Recursos

### Equipe Sugerida - Fase 1

| Papel | Quantidade | Responsabilidades |
|-------|------------|-------------------|
| **Tech Lead / Fullstack** | 1 | Arquitetura, APIs, integrações |
| **Backend Developer** | 1 | APIs, banco de dados, deploy |
| **Frontend Developer** | 1 | Angular, UI/UX, mapa |
| **UI/UX Designer** | 0.5 | Design system, protótipos |
| **QA Engineer** | 0.5 | Testes, qualidade |
| **DevOps** | 0.5 | CI/CD, infraestrutura |

**Total**: 4.5 pessoas/tempo integral

### Recursos Externos
- **Google Maps Platform**: Documentação e suporte
- **Google Gemini API**: Documentação
- **Prisma**: Community e docs
- **Stack Overflow**: Comunidade

---

## ✅ Checklist de Conclusão da Fase 1

### Backend
- [ ] Todas as APIs implementadas
- [ ] Testes > 80% coverage
- [ ] Swagger documentado
- [ ] Seed de dados funcionando
- [ ] Deploy em produção

### Frontend
- [ ] Todas as páginas implementadas
- [ ] Responsivo (mobile/tablet/desktop)
- [ ] Dark/Light theme funcionando
- [ ] Testes E2E passando
- [ ] Deploy em produção

### Infraestrutura
- [ ] CI/CD configurado
- [ ] Monitoramento ativo
- [ ] Backups automáticos
- [ ] SSL configurado
- [ ] Logs centralizados

### Documentação
- [ ] README completo
- [ ] Swagger atualizado
- [ ] Guia de deploy
- [ ] Guia de usuário
- [ ] Vídeos tutoriais (opcional)

### Segurança
- [ ] Security audit realizado
- [ ] Penetration testing
- [ ] OWASP checklist verificado
- [ ] Política de privacidade
- [ ] Termos de uso

---

## 📄 Anexos

### A. Variáveis de Ambiente

```env
# .env.example

# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:4200
API_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/uber4hub
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@uber4hub.com

# Google
GOOGLE_MAPS_API_KEY=your-google-maps-key
GEMINI_API_KEY=your-gemini-api-key

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=uber4hub-uploads

# Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### B. Scripts Úteis

```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "ts-node prisma/seed.ts",
    "prisma:studio": "prisma studio",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

---

**Fim do Relatório - Fase 1**

*Documento preparado para migração do sistema legado e implementação de backend/frontend completo do Uber4Hub Dashboard.*

**Próxima Revisão**: Após 4 semanas de desenvolvimento
