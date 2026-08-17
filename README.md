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
| Proxy reverso | Nginx (produção) |

---

## Funcionalidades

- Autenticação via Google OAuth
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
```

---

## Como rodar (desenvolvimento)

### 1. Subir o banco de dados

```bash
docker compose up postgres -d
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

---

## Deploy (produção)

A stack de produção usa Nginx como reverse proxy para servir API e frontend no **mesmo domínio**, garantindo que os cookies do better-auth sejam compartilhados sem configurações extras.

```
https://seuapp.duckdns.org/api/auth/*    → API (porta 8081)
https://seuapp.duckdns.org/workout-plans → API (porta 8081)
https://seuapp.duckdns.org/me, /stats…   → API (porta 8081)
https://seuapp.duckdns.org/              → Frontend (porta 3000)
```

### Opção gratuita: Oracle OCI Free Tier + DuckDNS

| Item | Custo |
|---|---|
| Oracle OCI VM (ARM A1) + IP público | Grátis |
| DuckDNS subdomain | Grátis |
| Let's Encrypt SSL | Grátis |
| **Total** | **R$0** |

### Passo a passo

#### 1. VM no OCI
- Shape: **VM.Standard.A1.Flex** (ARM, Free Tier)
- OS: Ubuntu 22.04
- Anotar o IP público

#### 2. Abrir portas no OCI
Security List → adicionar regras de entrada para portas **80** e **443**.

No Ubuntu:
```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo apt install iptables-persistent && sudo netfilter-persistent save
```

#### 3. Domínio grátis — DuckDNS
1. Acesse [duckdns.org](https://www.duckdns.org) e crie `seuapp.duckdns.org`
2. Aponte para o IP público da VM

#### 4. Instalar Docker
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

#### 5. Variáveis de ambiente (produção)
```env
API_BASE_URL=https://seuapp.duckdns.org
WEB_APP_BASE_URL=https://seuapp.duckdns.org
```

#### 6. Subir os serviços
Adicione o serviço do frontend no `docker-compose.yml` e suba tudo:
```bash
docker compose up -d --build
```

#### 7. SSL grátis — Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seuapp.duckdns.org
```

O certbot configura HTTPS automaticamente e renova o certificado via cron.

> O arquivo `nginx/nginx.conf` já está pré-configurado com o roteamento correto.

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
nginx/
└── nginx.conf            # Configuração do reverse proxy
prisma/
└── schema.prisma         # Schema do banco de dados
```

---

## Frontend

O frontend (Next.js 16 + React 19 + Tailwind CSS 4) está em repositório separado: [`LifeFit-frontEnd`](../LifeFit-frontEnd).

Variáveis necessárias no frontend:

```env
# desenvolvimento
NEXT_PUBLIC_API_URL=http://localhost:8081

# produção (mesmo domínio via Nginx)
NEXT_PUBLIC_API_URL=https://seuapp.duckdns.org
```

O cliente HTTP é gerado automaticamente via **Orval** a partir do `/swagger.json` da API.
