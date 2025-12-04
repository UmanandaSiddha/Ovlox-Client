# 🚀 **Ovlox – Engineering Intelligence Platform**

*AI-powered context, insights & automation for engineering teams.*

Ovlox unifies data from **GitHub, Slack, Discord, Notion, Jira** and transforms it into **centralized project intelligence**.\
The platform ingests commits, pull requests, issues, messages, tasks, and more — then uses **LLMs + vector search** to generate summaries, insights, predictions, and provide **Chat-with-Project** functionality.

---

## 🔥 **Key Features**

### **📥 Multisource Integration**

Connect:

- GitHub (Repos, Commits, PRs, Issues)

- Slack (Channels, Messages)

- Discord (Channels, Messages)

- Notion (Databases, Pages)

- Jira (Issues, Sprints, Tasks)

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

- **Next.js 15 App Router**

- **Tailwind + shadcn/ui**

- **Zustand for state**

- **TanStack Query for server state**

- **Server actions + API proxies**

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

- 🔲 Finish Auth module (OTP, password, Google)

- 🔲 Organization membership & invitations

- 🔲 Historical ingestion engine & workers

- 🔲 Integration APIs (GitHub/Slack/Discord/Notion/Jira)

- 🔲 Webhook processors

- 🔲 LLM summarization engine

- 🔲 Project chat retrieval system

- 🔲 Task sync (Notion/Jira)

### **Frontend**

- 🔲 Signin / Signup / Forgot password

- 🔲 Dashboard layout (sidebar + topbar)

- 🔲 Organization management UI

- 🔲 Project overview pages

- 🔲 Integration setup wizard

- 🔲 Event feed

- 🔲 Chat-with-project

- 🔲 Task board

- 🔲 Insights views

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