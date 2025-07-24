# 🚀 NIT-JSR Hub v 1

**Digital companion platform for NIT Jamshedpur students**—attendance tracking, campus marketplace, real‑time chat, and more, all in one modular, extensible ecosystem.

---

## the version 2 uses postgresql using supabase and drizzle, redis for caching , custom socket io server

## 🎯 Key Features

* **Real-Time Attendance Dashboard**
  Track and visualize your attendance live: see percentages per course, historical charts, and AI-driven trend forecasting to predict future attendance.
* **Campus-Only Marketplace**
  Post, browse, and transact study materials and electronics exclusively within NIT-JSR, with search, filtering, and safe user ratings.
* **Integrated Chat & Anonymous Messaging**
  One-on-one and group chat powered by Socket.IO, plus dedicated anonymous channels for candid feedback, all secured with end-to-end encryption.
* **AI-Powered Chat Commands**
  Use `@bot` commands to generate study tips, summarize discussion threads, or fetch campus announcements on-the-fly.
* **Modular Plugin Architecture**
  Easily add or remove features (attendance, chat, marketplace, anonymous) as separate modules—no monolithic codebase headaches.
* **Responsive & Accessible UI**
  Built with Shadcn/ui, Radix, and Tailwind CSS, ensuring mobile-first design, dark mode, and WCAG-compliant accessibility.

---

## 🛠 Tech Stack

| Layer          | Technology                                    |
| -------------- | --------------------------------------------- |
| Framework      | Next.js (App Router)                          |
| Language       | TypeScript                                    |
| UI Components  | Shadcn/ui, Radix, Tailwind CSS, Framer Motion |
| Database       | Mongodb        | Prisma ORM
| Real‑Time      | Pusher         |
| Authentication | Next Auth                                 |
| Storage        | Supabase Storage                              |
| Deployment     | Vercel (Frontend/API), Render (for servers)      |

---

## 📂 Project Structure

```
/apps
  ├─ attendance    # Attendance module (Dashboard, Calendar, Leaderboard)
  ├─ chat          # Chat module (Socket.IO integration, UI components)
  ├─ marketplace   # Marketplace module (Products CRUD)
  ├─ anonymous     # Anonymous messaging module
  └─ videoChat     # Group/Personal WebRTC rooms
/components      # Shared UI components
/schemas         # Zod schemas & validations
/types           # Shared TypeScript types
/pages/api       # Next.js API routes (Auth, REST endpoints)
```

---

## ⚙️ Getting Started

### 1. Prerequisites

* Node.js >= 18
* PNPM or npm
* Supabase account (free tier)

### 2. Clone & Install

```bash
git clone https://github.com/your-org/nit-jsr-hub.git
cd nit-jsr-hub
pnpm install
```

### 3. Environment Variables

Create a `.env.local` at project root:

```
NEXT_PUBLIC_SUPABASE_URL=...  
NEXT_PUBLIC_SUPABASE_ANON_KEY=...  
DATABASE_URL=...  
```

### 4. Run in Development

```bash
pnpm dev
```

---

## 🚀 Deployment

1. **Frontend/API**
   Push to `main`; Vercel will auto‑deploy your Next.js app.
2. **Socket.IO Server**
   Deploy `/lib/socket/server.js` to Fly.io as a separate service. Use the provided Fly.io config.
3. **Database & Auth**
   Managed by Supabase (no extra steps).

---

## 🤝 Contributing

We follow a **modular plugin** model—each feature lives under `/apps/<feature>`. To contribute:

1. Fork the repo & create your feature under `/apps/oops`
2. Add your routes, Drizzle queries, and UI components
3. Draft a PR against `main`
4. CI runs lint, type‑check, and integration tests

**Scaffold a new module:**

```bash
pnpm run create:app <app-name>
```

---
