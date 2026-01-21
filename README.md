# 🚀 **Ovlox – Engineering Intelligence Platform**

*AI-powered context, insights & automation for engineering teams.*

Ovlox unifies data from **GitHub, Slack, Discord, Jira** and transforms it into **centralized project intelligence**.\
The platform ingests commits, pull requests, issues, messages, tasks, and more — then uses **LLMs + vector search** to generate summaries, insights, predictions, and provide **Chat-with-Project** functionality.

---

## 🔥 **Key Features**

### **📥 Multisource Integration**

Connect:

- ✅ **GitHub** (Repos, Commits, PRs, Issues) - OAuth App Installation
- ✅ **Slack** (Channels, Messages) - OAuth Integration
- ✅ **Discord** (Channels, Messages) - OAuth Integration
- ✅ **Jira** (Issues, Sprints, Tasks) - OAuth Integration
- 🔲 **Notion** (Databases, Pages) - Coming soon
- 🔲 **Figma** (Design Files) - Coming soon

### **🧠 LLM-Powered Insights**

- Event summarization

- Daily / weekly reports

- Feature progress estimates

- Risk & bottleneck detection

- Chat with the entire project history

- Embedding-based semantic search

### **🏢 Organizations & Roles**

- Multiple organizations

- Predefined roles: Owner, Admin, Developer, Viewer

- Custom roles with permission sets

- Member management + invites

- Identity mapping for contributors

### **🧩 Projects**

- Per-project integrations

- Real-time activity feed

- Event timeline

- AI summaries

- Tasks (from Notion / Jira)

- Project health analytics

### **🕸 Webhooks + Historical Import**

- Webhooks for real-time events

- Historical backfill for repos, channels, tasks

- Automatic normalization & processing

---

# 🏗 **Architecture Overview**

### **Backend (NestJS)**

- **NestJS + Prisma + PostgreSQL**

- **Redis + BullMQ** for queues

- **Socket.IO** for realtime

- **OpenAI / Anthropic / Local Models**

- **Vector storage** (pgvector or external)

- **Robust background workers**

### **Frontend (Next.js)**

- **Next.js 15 App Router** with route groups
- **Tailwind + shadcn/ui** components
- **Zustand** for global state management
- **Axios** with interceptors for API calls and token refresh
- **WebSocket (Socket.IO)** for real-time chat
- **Server-Sent Events (SSE)** for integration status updates
- **React Icons** for integration icons

---

# 📂 Folder Structure

```
ovlox/
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── organization/
│   │   │   ├── project/
│   │   │   ├── integration/
│   │   │   ├── ingestion/
│   │   │   ├── webhook/
│   │   │   ├── llm/
│   │   │   └── events/
│   │   ├── services/
│   │   ├── queues/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── decorators/
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── lib/
    │   ├── store/
    │   ├── hooks/
    │   └── utils/
    └── .env.local
```

---

# 🛢 Database Schema (Core Models)

Includes models for:

- `User`, `Organization`, `OrganizationMember`

- `RoleTemplate`

- `Identity`, `IdentityAlias`, `ContributorMap`

- `Project`

- `Integration`, `IntegrationConnection`, `IntegrationResource`

- `RawEvent` (normalized provider events)

- `CodeChange`

- `Task`

- `LlmOutput`, `Embedding`

- `WebhookEvent`

- `IngestionJob`

> The schema is optimized for:
>
> - fast querying
>
> - clean integration mapping
>
> - scalable ingestion
>
> - efficient LLM processing
>
> - realtime updates

---

# ⚙️ Backend Setup

### **1. Install dependencies**

```
pnpm install
```

### **2. Create** `.env`

```
DATABASE_URL="postgresql://postgres:password@localhost:5433/ovlox?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET="long_random_secret"
```

### **3. Apply Prisma migrations**

```
npx prisma migrate dev
```

### **4. Generate Prisma client**

```
npx prisma generate
```

### **5. Start backend**

```
pnpm start:dev
```

---

# 💻 Frontend Setup

### **1. Install dependencies**

```
pnpm install
```

### **2. Create** `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### **3. Run dev server**

```
pnpm dev
```

---

# 🧵 Queues Used

| Queue | Purpose |
| --- | --- |
| **INGESTION_QUEUE** | Historical import (repos, channels, tasks) |
| **WEBHOOK_QUEUE** | All provider webhook events |
| **LLM_QUEUE** | Summaries, embeddings, analytics |
| **EMAIL_QUEUE** | Invite + notification emails |

---

# 🤖 LLM Pipeline

1. Raw event arrives (webhook or ingestion)

2. Normalize and store in `RawEvent`

3. Push job → **LLM_QUEUE**

4. Generate:

   - Summary

   - Vector embedding

   - Risk analysis

5. Store in `LlmOutput` + `Embedding`

6. Mark event as `processedByLLM = true`

---

# 🗂 Features In Progress (TODO)

### **Backend**

- ✅ **Auth Module** - JWT-based authentication with access/refresh tokens
- ✅ **Organization Membership** - Member management and invitation system
- 🔲 **Historical Ingestion** - Engine & workers for backfilling data
- ✅ **Integration APIs** - GitHub, Slack, Discord, Jira OAuth flows
- 🔲 **Webhook Processors** - Real-time event processing from integrations
- 🔲 **LLM Summarization** - Engine for generating summaries and insights
- ✅ **Project Chat** - RAG retrieval system for chat-with-project
- 🔲 **Task Sync** - Sync tasks from Jira integrations

### **Frontend**

- ✅ **Authentication** - Signin, Signup with OTP support, JWT token management
- ✅ **Dashboard Layout** - Main layout with sidebar and navbar (hosted on `/`)
- ✅ **Organization Management** - List, detail, members, invites, integrations pages
- ✅ **Project Management** - List, detail, create, with integration linking
- ✅ **Integration Setup** - GitHub, Slack, Discord, Jira integration wizards
- ✅ **Project Chat** - RAG chat bot with conversation management
- ✅ **Project Switcher** - Organization and project selection in navbar
- ✅ **Project-wise Sidebar** - Dynamic menu based on selected project
- 🔲 **Event Feed** - Real-time project events timeline
- 🔲 **Task Board** - Project tasks management
- 🔲 **Insights Views** - Project analytics and insights

---

# 🧪 Testing Strategy

- **Unit tests** for services (auth, orgs, projects, integrations)

- **E2E tests** for full workflows

- **Load testing** ingestion pipeline

- **Mock providers** for GitHub/Slack/Discord

---

# 📌 Roadmap

- 🚀 MVP launch with GitHub + Slack + AI summaries

- ✨ Add full project insights & timelines

- 🧠 Expand LLM reasoning agents

- 📊 Advanced analytics dashboards

- 🛠 IDE plugin (VSCode)

- 🧩 Open source public SDK

---

# ❤️ Contributing

PRs, issues, and ideas are welcome.