# 🔌 Especificação Técnica de APIs - Uber4Hub

## Documentação Detalhada dos Endpoints

---

## 1. Authentication API

### 1.1 POST /api/auth/register

**Descrição**: Registrar novo usuário no sistema

**Autenticação**: Não requerida

**Request Body**:
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "Senha@123",
  "phone": "+55 34 99999-9999",
  "organization_name": "Tech Startup Ltda" // opcional
}
```

**Validações**:
- `name`: obrigatório, min 3, max 100 caracteres
- `email`: obrigatório, formato email válido, único
- `password`: obrigatório, min 8 caracteres, 1 maiúscula, 1 número, 1 especial
- `phone`: opcional, formato telefone válido
- `organization_name`: opcional, max 200 caracteres

**Response 201**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "USER",
      "is_email_verified": false,
      "created_at": "2026-01-03T20:00:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2g...",
      "expires_in": 3600
    }
  },
  "message": "Usuário registrado com sucesso. Verifique seu email para ativar a conta."
}
```

**Response 400** (Email já cadastrado):
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Este email já está cadastrado",
    "field": "email"
  }
}
```

**Response 422** (Validação falhou):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Erro de validação",
    "details": [
      {
        "field": "password",
        "message": "Senha deve conter ao menos 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial"
      }
    ]
  }
}
```

---

### 1.2 POST /api/auth/login

**Descrição**: Autenticar usuário

**Request Body**:
```json
{
  "email": "joao@example.com",
  "password": "Senha@123",
  "remember_me": true // opcional
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "USER",
      "avatar_url": "https://cdn.uber4hub.com/avatars/joao.jpg",
      "organization": {
        "id": "uuid",
        "name": "Tech Startup Ltda"
      }
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2g...",
      "expires_in": 3600
    }
  }
}
```

**Response 401** (Credenciais inválidas):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou senha incorretos"
  }
}
```

**Response 403** (Email não verificado):
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Por favor, verifique seu email antes de fazer login",
    "action": {
      "type": "resend_verification",
      "endpoint": "/api/auth/resend-verification"
    }
  }
}
```

**Response 429** (Muitas tentativas):
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_ATTEMPTS",
    "message": "Muitas tentativas de login. Tente novamente em 15 minutos.",
    "retry_after": 900
  }
}
```

---

### 1.3 GET /api/auth/me

**Descrição**: Obter dados do usuário autenticado

**Autenticação**: Bearer Token

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "+55 34 99999-9999",
    "role": "USER",
    "avatar_url": "https://cdn.uber4hub.com/avatars/joao.jpg",
    "is_email_verified": true,
    "organization": {
      "id": "uuid",
      "name": "Tech Startup Ltda",
      "logo_url": "https://cdn.uber4hub.com/logos/tech.jpg"
    },
    "created_at": "2026-01-01T10:00:00Z",
    "last_login": "2026-01-03T20:00:00Z"
  }
}
```

---

## 2. Organizations API

### 2.1 GET /api/organizations

**Descrição**: Listar organizações com filtros e paginação

**Autenticação**: Opcional (públicas visíveis sem auth)

**Query Parameters**:
```
?page=1
&limit=25
&search=tech
&category=STARTUP,TECH_COMPANY
&sector=Tecnologia
&city=Uberlândia
&has_rating=true
&min_rating=4.0
&sort_by=name
&sort_order=asc
&is_verified=true
&featured=true
```

**Parâmetros**:
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `page` | number | 1 | Página atual |
| `limit` | number | 25 | Items por página (max: 100) |
| `search` | string | - | Busca por nome, descrição |
| `category` | string[] | - | Filtro por categoria (separado por vírgula) |
| `sector` | string | - | Filtro por setor |
| `city` | string | Uberlândia | Filtro por cidade |
| `has_rating` | boolean | - | Apenas com avaliação |
| `min_rating` | number | - | Rating mínimo (1-5) |
| `sort_by` | string | created_at | Campo de ordenação |
| `sort_order` | asc/desc | desc | Ordem |
| `is_verified` | boolean | - | Apenas verificadas |
| `featured` | boolean | - | Apenas destacadas |

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "EZ SOFT",
      "slug": "ez-soft",
      "category": "STARTUP",
      "category_emoji": "🚀",
      "pin_color": "#FF6B6B",
      "sector": "Desenvolvimento de software",
      "description": "Plataforma de automação de atendimentos em canais digitais",
      "logo_url": "https://cdn.uber4hub.com/logos/ezsoft.jpg",
      "address": "Av. Cesário Alvim, 3813 - Brasil, Uberlândia - MG",
      "latitude": -18.8948989,
      "longitude": -48.2568953,
      "rating": 4.4,
      "total_ratings": 50,
      "phone": "(34) 3218-7079",
      "website": "https://ezsoft.com.br/",
      "is_verified": true,
      "featured": false,
      "created_at": "2026-01-01T10:00:00Z"
    }
    // ... mais organizações
  ],
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 619,
    "total_pages": 25,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### 2.2 GET /api/organizations/:id

**Descrição**: Buscar organização por ID

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "EZ SOFT",
    "slug": "ez-soft",

    // Localização
    "address": "Av. Cesário Alvim, 3813 - Brasil, Uberlândia - MG, 38400-696",
    "latitude": -18.8948989,
    "longitude": -48.2568953,
    "neighborhood": "Brasil",
    "city": "Uberlândia",
    "state": "MG",
    "postal_code": "38400-696",

    // Contato
    "phone": "(34) 3218-7079",
    "email": "contato@ezsoft.com.br",
    "website": "https://ezsoft.com.br/",
    "social_media": {
      "linkedin": "https://linkedin.com/company/ezsoft",
      "instagram": "@ezsoft"
    },

    // Categorização
    "category": "STARTUP",
    "category_emoji": "🚀",
    "pin_color": "#FF6B6B",
    "icon": "rocket",
    "sector": "Desenvolvimento de software",
    "subsector": "SaaS",

    // Informações de negócio
    "description": "Plataforma completa de automação...",
    "solution": "Solução de atendimento omnichannel...",
    "business_model": "SaaS (Software as a service)",
    "target_audience": "Empresas B2B",
    "startup_phase": "Escala",
    "employees_range": "51-100 colaboradores",

    // Investimento
    "received_investment": false,
    "investment_amount_range": null,
    "investor_location": null,

    // Mídia
    "logo_url": "https://cdn.uber4hub.com/logos/ezsoft.jpg",
    "cover_image_url": "https://cdn.uber4hub.com/covers/ezsoft.jpg",
    "gallery_images": [
      "https://cdn.uber4hub.com/gallery/ezsoft-1.jpg",
      "https://cdn.uber4hub.com/gallery/ezsoft-2.jpg"
    ],

    // Avaliações
    "rating": 4.4,
    "total_ratings": 50,
    "reviews_summary": {
      "5_stars": 30,
      "4_stars": 15,
      "3_stars": 3,
      "2_stars": 1,
      "1_star": 1
    },

    // Horário
    "opening_hours": "segunda-feira: 08:00 – 17:00 | terça-feira: 08:00 – 17:00...",

    // Metadados
    "data_source": "merged",
    "is_verified": true,
    "is_active": true,
    "featured": false,

    // Manager (apenas se autenticado e for manager/admin)
    "managers": [
      {
        "id": "uuid",
        "name": "João Silva",
        "email": "joao@ezsoft.com.br"
      }
    ],

    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-02T15:30:00Z"
  }
}
```

**Response 404**:
```json
{
  "success": false,
  "error": {
    "code": "ORGANIZATION_NOT_FOUND",
    "message": "Organização não encontrada"
  }
}
```

---

### 2.3 POST /api/organizations

**Descrição**: Criar nova organização

**Autenticação**: Bearer Token

**Request Body**:
```json
{
  "name": "Nova Tech Startup",
  "category": "STARTUP",
  "sector": "Tecnologia",
  "subsector": "EdTech",

  "address": "Rua Exemplo, 123 - Centro, Uberlândia - MG",
  "postal_code": "38400-000",

  "phone": "(34) 99999-9999",
  "email": "contato@novatech.com",
  "website": "https://novatech.com",
  "social_media": {
    "linkedin": "https://linkedin.com/company/novatech",
    "instagram": "@novatech"
  },

  "description": "Startup de educação tecnológica...",
  "solution": "Plataforma de ensino de programação...",
  "business_model": "SaaS",
  "target_audience": "B2C",
  "startup_phase": "Validação",
  "employees_range": "1-5 colaboradores",

  "received_investment": false
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nova Tech Startup",
    "slug": "nova-tech-startup",
    "status": "pending_approval",
    "message": "Organização criada com sucesso! Aguardando aprovação do administrador."
  }
}
```

**Response 422** (Validação):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Erro de validação",
    "details": [
      {
        "field": "address",
        "message": "Não foi possível geocodificar o endereço fornecido"
      }
    ]
  }
}
```

**Response 409** (Duplicado):
```json
{
  "success": false,
  "error": {
    "code": "ORGANIZATION_ALREADY_EXISTS",
    "message": "Já existe uma organização com este nome e endereço",
    "existing_id": "uuid"
  }
}
```

---

### 2.4 PUT /api/organizations/:id

**Descrição**: Atualizar organização completa

**Autenticação**: Bearer Token (Manager/Admin)

**Permissões**:
- Owner/Manager: pode editar própria organização
- Admin: pode editar qualquer organização
- Super Admin: pode editar tudo

**Request Body**: (mesmos campos do POST, todos opcionais)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nova Tech Startup",
    // ... dados atualizados
    "updated_at": "2026-01-03T21:00:00Z"
  },
  "message": "Organização atualizada com sucesso"
}
```

**Response 403**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Você não tem permissão para editar esta organização"
  }
}
```

---

### 2.5 POST /api/organizations/:id/upload-logo

**Descrição**: Upload de logo da organização

**Autenticação**: Bearer Token (Manager/Admin)

**Content-Type**: `multipart/form-data`

**Form Data**:
```
logo: [File] (max 5MB, jpg/png/webp)
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "logo_url": "https://cdn.uber4hub.com/logos/nova-tech-startup.jpg",
    "thumbnail_url": "https://cdn.uber4hub.com/logos/thumbs/nova-tech-startup.jpg"
  }
}
```

**Response 413** (Arquivo muito grande):
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "Arquivo excede o tamanho máximo de 5MB",
    "max_size": 5242880
  }
}
```

---

### 2.6 GET /api/organizations/map

**Descrição**: Obter organizações para renderização no mapa (otimizado)

**Query Parameters**:
```
?bounds=-18.95,-48.30,-18.88,-48.20
&categories=STARTUP,TECH_COMPANY
&zoom=13
```

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "EZ SOFT",
      "latitude": -18.8948989,
      "longitude": -48.2568953,
      "category": "STARTUP",
      "category_emoji": "🚀",
      "pin_color": "#FF6B6B",
      "logo_url": "https://cdn.uber4hub.com/logos/thumbs/ezsoft.jpg",
      "rating": 4.4
    }
    // ... apenas dados essenciais para o mapa
  ],
  "meta": {
    "total": 45,
    "bounds": {
      "south": -18.95,
      "west": -48.30,
      "north": -18.88,
      "east": -48.20
    }
  }
}
```

---

## 3. Routes API (IA)

### 3.1 POST /api/routes/generate

**Descrição**: Gerar rota otimizada (modo configuração manual)

**Request Body**:
```json
{
  "criteria": {
    "priority": "balanced", // distance | sector | phase | balanced
    "max_stops": 5,
    "sectors": ["Tecnologia", "Educação"], // opcional
    "categories": ["STARTUP"], // opcional
    "start_point": { // opcional
      "latitude": -18.9186,
      "longitude": -48.2772
    }
  },
  "organizations": [
    // Array de IDs ou objetos completos
    "uuid1", "uuid2", "uuid3", // ...
  ]
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "route": [
      {
        "order": 1,
        "organization": {
          "id": "uuid",
          "name": "EZ SOFT",
          "latitude": -18.8948989,
          "longitude": -48.2568953,
          "category": "STARTUP",
          "sector": "Tecnologia"
        },
        "reason": "Ponto de partida - mais próximo da localização inicial"
      },
      {
        "order": 2,
        "organization": {
          "id": "uuid2",
          "name": "Virtux Tech",
          "latitude": -18.9186075,
          "longitude": -48.2660083
        },
        "reason": "Próxima parada - mesmo setor de tecnologia"
      }
      // ... mais paradas
    ],
    "total_distance": "8.5 km",
    "estimated_time": "25 minutos",
    "description": "Rota otimizada visitando 5 startups de tecnologia em Uberlândia",
    "highlights": [
      "Todas as startups estão em fase de escala",
      "3 organizações receberam investimento",
      "Rota otimizada para menor distância total"
    ],
    "optimization_used": "balanced"
  }
}
```

---

### 3.2 POST /api/routes/generate-from-prompt

**Descrição**: Gerar rota usando prompt em linguagem natural (IA)

**Request Body**:
```json
{
  "prompt": "Quero visitar 4 startups no centro de Uberlândia que trabalham com educação",
  "organizations": [
    // Array de organizações disponíveis (mesmo do endpoint anterior)
  ]
}
```

**Response 200**: (mesmo formato do /generate)

**Response 400** (Prompt inválido):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PROMPT",
    "message": "Não foi possível interpretar o prompt. Tente ser mais específico.",
    "suggestions": [
      "Especifique o número de paradas desejadas",
      "Mencione o setor ou categoria de interesse",
      "Indique a região ou bairro preferido"
    ]
  }
}
```

---

### 3.3 POST /api/routes/save

**Descrição**: Salvar rota gerada

**Autenticação**: Bearer Token

**Request Body**:
```json
{
  "name": "Rota Startups EdTech",
  "description": "Visita a startups de educação tecnológica",
  "route_data": {
    // Dados completos da rota do endpoint /generate
  }
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Rota Startups EdTech",
    "created_at": "2026-01-03T21:00:00Z"
  }
}
```

---

### 3.4 GET /api/routes/my-routes

**Descrição**: Listar rotas salvas do usuário

**Autenticação**: Bearer Token

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Rota Startups EdTech",
      "description": "Visita a startups de educação tecnológica",
      "total_distance": "8.5 km",
      "estimated_time": "25 minutos",
      "organization_count": 4,
      "created_at": "2026-01-03T21:00:00Z"
    }
    // ... mais rotas
  ]
}
```

---

## 4. Analytics API

### 4.1 GET /api/analytics/overview

**Descrição**: Visão geral do ecossistema

**Response 200**:
```json
{
  "success": true,
  "data": {
    "total_organizations": 619,
    "by_category": {
      "TECH_COMPANY": 262,
      "STARTUP": 275,
      "COWORKING": 6,
      "TECH_POLE": 1,
      "ACCELERATOR": 1,
      "SUPPORT_ENTITY": 2,
      "ACADEMY": 9,
      "TRAINING": 22,
      "CORPORATE": 41
    },
    "growth": {
      "last_30_days": 12,
      "last_90_days": 35,
      "percentage_growth": 6.2
    },
    "top_sectors": [
      {
        "name": "Tecnologia",
        "count": 180,
        "percentage": 29.1
      },
      {
        "name": "Educação",
        "count": 45,
        "percentage": 7.3
      }
      // ... mais setores
    ],
    "verified_count": 520,
    "with_rating_count": 340,
    "average_rating": 4.2
  }
}
```

---

### 4.2 GET /api/analytics/by-sector

**Descrição**: Distribuição por setor

**Query Parameters**:
```
?limit=10
&category=STARTUP
```

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "sector": "Tecnologia",
      "count": 180,
      "percentage": 29.1,
      "categories": {
        "STARTUP": 120,
        "TECH_COMPANY": 50,
        "CORPORATE": 10
      }
    }
    // ... mais setores
  ]
}
```

---

## 5. Reviews API

### 5.1 GET /api/organizations/:id/reviews

**Descrição**: Listar avaliações de uma organização

**Query Parameters**:
```
?page=1
&limit=10
&sort=recent (recent | helpful | rating_desc | rating_asc)
```

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Excelente startup! Atendimento impecável.",
      "user": {
        "id": "uuid",
        "name": "Maria Santos",
        "avatar_url": "https://cdn.uber4hub.com/avatars/maria.jpg"
      },
      "is_verified_visit": true,
      "helpful_count": 12,
      "created_at": "2026-01-02T10:00:00Z",
      "updated_at": "2026-01-02T10:00:00Z"
    }
    // ... mais reviews
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "summary": {
      "5_stars": 30,
      "4_stars": 15,
      "3_stars": 3,
      "2_stars": 1,
      "1_star": 1,
      "average": 4.4
    }
  }
}
```

---

### 5.2 POST /api/organizations/:id/reviews

**Descrição**: Criar avaliação

**Autenticação**: Bearer Token

**Request Body**:
```json
{
  "rating": 5,
  "comment": "Excelente startup! Atendimento impecável."
}
```

**Validações**:
- Usuário não pode avaliar a própria organização
- Usuário pode ter apenas 1 avaliação por organização
- Rating: 1-5 (obrigatório)
- Comment: max 1000 caracteres (opcional)

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "rating": 5,
    "comment": "Excelente startup! Atendimento impecável.",
    "created_at": "2026-01-03T21:00:00Z"
  },
  "message": "Avaliação publicada com sucesso"
}
```

**Response 403** (Tentando avaliar própria org):
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_REVIEW_OWN_ORGANIZATION",
    "message": "Você não pode avaliar sua própria organização"
  }
}
```

**Response 409** (Já avaliou):
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_REVIEWED",
    "message": "Você já avaliou esta organização",
    "existing_review_id": "uuid"
  }
}
```

---

## 6. Códigos de Erro Padronizados

| Código | HTTP | Descrição |
|--------|------|-----------|
| `VALIDATION_ERROR` | 422 | Erro de validação de campos |
| `INVALID_CREDENTIALS` | 401 | Email/senha incorretos |
| `EMAIL_NOT_VERIFIED` | 403 | Email não verificado |
| `EMAIL_ALREADY_EXISTS` | 409 | Email já cadastrado |
| `ORGANIZATION_NOT_FOUND` | 404 | Organização não encontrada |
| `ORGANIZATION_ALREADY_EXISTS` | 409 | Organização duplicada |
| `FORBIDDEN` | 403 | Sem permissão |
| `UNAUTHORIZED` | 401 | Não autenticado |
| `TOO_MANY_ATTEMPTS` | 429 | Rate limit excedido |
| `FILE_TOO_LARGE` | 413 | Arquivo muito grande |
| `INVALID_FILE_TYPE` | 422 | Tipo de arquivo inválido |
| `GEOCODING_FAILED` | 422 | Falha ao geocodificar endereço |
| `CANNOT_REVIEW_OWN_ORGANIZATION` | 403 | Não pode avaliar própria org |
| `ALREADY_REVIEWED` | 409 | Já avaliou esta organização |
| `INVALID_PROMPT` | 400 | Prompt IA inválido |
| `INTERNAL_ERROR` | 500 | Erro interno do servidor |

---

## 7. Rate Limiting

**Limites**:
- **Não autenticado**: 100 requests / 15 minutos / IP
- **Usuário autenticado**: 1000 requests / 15 minutos / usuário
- **Admin**: 5000 requests / 15 minutos

**Headers de Response**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704317400
```

**Response 429**:
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Muitas requisições. Tente novamente em 5 minutos.",
    "retry_after": 300
  }
}
```

---

## 8. Webhooks (Fase 2)

**Eventos disponíveis**:
- `organization.created`
- `organization.updated`
- `organization.approved`
- `organization.rejected`
- `review.created`
- `user.registered`

**Payload exemplo**:
```json
{
  "event": "organization.created",
  "timestamp": "2026-01-03T21:00:00Z",
  "data": {
    "id": "uuid",
    "name": "Nova Tech Startup",
    // ... dados da organização
  }
}
```

---

**Fim da Especificação de APIs**
