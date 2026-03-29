# LifeFit — API

Backend da aplicação **Fit.ai**: plataforma de fitness com planos de treino personalizados, sessões, estatísticas de consistência e assistente de IA personal trainer.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 24+ |
| Linguagem | TypeScript (ESM, target ES2024) |
| Servidor | Fastify 5 |
| Banco de dados | PostgreSQL 17 via Prisma 7 |
| Autenticação | better-auth (Google OAuth) |
| IA | Vercel AI SDK + Gemini 2.5 Flash |
| Documentação | Swagger + Scalar (`/docs`) |
| Validação | Zod |

---

## Funcionalidades

- Autenticação via Google OAuth com suporte a cookies cross-subdomain
- CRUD de planos de treino e dias com exercícios (séries, repetições, descanso)
- Sessões de treino por dia (iniciar e concluir)
- Home por data: treino do dia, streak e consistência
- Perfil com métricas corporais (peso, altura, idade, % gordura)
- Estatísticas em intervalo de datas: streak, consistência diária, taxa de conclusão
- Chat com IA em streaming — personal trainer virtual capaz de criar planos completos, ler e atualizar dados do usuário

---

## Pré-requisitos

- Node.js >= 24
- pnpm >= 10
- Docker e Docker Compose

---

## Configuração

Crie um arquivo `.env` na raiz com base nas variáveis abaixo:

```env
PORT=8081
DATABASE_URL=postgresql://user:password@localhost:5432/life_fit

BETTER_AUTH_SECRET=
API_BASE_URL=http://localhost:8081

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GOOGLE_GENERATIVE_AI_API_KEY=
OPENAI_API_KEY=        # opcional

WEB_APP_BASE_URL=http://localhost:3000
SUBDOMAIN=             # usado em produção para cookies cross-subdomain (.{SUBDOMAIN}.com.br)
```

---

## Como rodar

### 1. Subir o banco de dados

```bash
docker compose up -d
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Aplicar migrações

```bash
pnpx prisma migrate deploy
```

### 4. Rodar em desenvolvimento

```bash
pnpm dev
```

### 5. Build e produção

```bash
pnpm build
pnpm start
```

---

## Docker (API)

O `dockerfile` usa build multi-stage. Para construir e rodar a imagem da API:

```bash
docker build -t lifefit-api .
docker run -p 8081:8081 --env-file .env lifefit-api
```

> O `docker-compose.yml` sobe apenas o PostgreSQL. Para orquestrar API + banco juntos, adicione o serviço da API ao compose.

---

## Endpoints

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | `/docs` | Documentação interativa (Scalar) |
| GET | `/swagger.json` | Schema OpenAPI |
| `*` | `/api/auth/*` | better-auth (sessão, OAuth, etc.) |
| GET | `/home/:date` | Dados da home (`YYYY-MM-DD`) |
| GET / PUT | `/me/` | Perfil e métricas do usuário |
| GET / POST | `/workout-plans/` | Listar e criar planos |
| GET | `/workout-plans/:id` | Detalhe de um plano |
| GET | `/workout-plans/:id/days/:dayId` | Dia de treino |
| POST | `/workout-plans/:id/days/:dayId/sessions` | Iniciar sessão |
| PATCH | `/workout-plans/:id/days/:dayId/sessions/:sessionId` | Atualizar sessão |
| GET | `/stats/` | Estatísticas (`?from=&to=`) |
| POST | `/ai/` | Chat com IA em streaming |

---

## Estrutura do projeto

```
src/
├── index.ts              # Entrada da aplicação
├── routes/               # Handlers das rotas (home, me, workoutPlan, stats, ai)
├── usecases/             # Casos de uso / lógica de negócio
├── schemas/              # Schemas Zod compartilhados
├── errors/               # Classes de erro customizadas
└── lib/
    ├── auth.ts           # Configuração do better-auth
    ├── db.ts             # Instância do Prisma
    └── env.ts            # Validação de variáveis de ambiente
prisma/
└── schema.prisma         # Schema do banco de dados
```

---

## Frontend

O frontend (Next.js 16 + React 19 + Tailwind CSS 4) está em repositório separado: [`LifeFit-frontEnd`](../LifeFit-frontEnd).

Variáveis necessárias no frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

O cliente HTTP é gerado automaticamente via **Orval** a partir do `/swagger.json` da API.
