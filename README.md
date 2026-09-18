# 🌺 AGOMONI — আগমনী

> **"এই পুজোয়, কিছু মানুষ আপন হোক।"**  
> *"Celebrate. Connect. Remember. Stay Safe."*

Agomoni is a complete, production-ready, full-stack Progressive Web App (PWA) combining Bengali Durga Puja culture, dating, lost & found, memory capsules, emergency system, global music experience, real-time chat, and Razorpay payments.

---

## 🌟 Five Core Pillars

1. **❤️ Puja Date (18+)**: Age-verified companion discovery using a multi-factor Vibe Match algorithm (puja days, time slots, interests, and proximity). Includes masked privacy cards, real-time Socket.IO chat with **3 free conversation unlocks**, and a ₹49 one-time Razorpay unlock for unlimited chats.
2. **🧒 Puja Lost & Found ("পুজোয় হারিয়ে গেলে খুঁজে দিন")**: Lost Person & Lost Item reporting with ₹29 publication order via Razorpay, automatic heuristic "Possible Match" detection engine, masked poster contact, and admin moderation.
3. **📦 Puja Memory Capsule ("My Puja 2026")**: 100% free digital diary across the festive timeline (Mahalaya -> Shashti -> Saptami -> Ashtami -> Nabami -> Dashami), mood/photo/text logs, private by default with unguessable token-based revocable share links.
4. **🚨 Puja Emergency**: Direct 1-tap access with explicit location consent, verified emergency helplines (112, 100, 108, Women Helpline 1090, Childline 1098), hospital directory, private personal emergency contacts, and an instant music mute switch.
5. **🎵 Puja Songs & "✨ Enter Puja Mode"**: Persistent floating mini-player and full-screen player that survives all page navigations, supporting HTML5 ambient audio (Dhak, Shehnai, Stotram) and official embed providers (YouTube / Spotify), playlist categorizations, and an immersive festive particle mode.

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Framer Motion, Socket.IO Client, PWA (Service Worker + Manifest).
- **Backend**: Node.js, Express, TypeScript, Socket.IO, Prisma ORM, Razorpay SDK, Helmet, Compression, Zod, Bcrypt.
- **Database**: PostgreSQL (Production) / SQLite (Local Dev & Testing), Prisma Client.
- **Cache & Realtime**: Redis (Production) / In-Memory (Dev), WebSockets (Socket.IO).
- **Internationalization**: Bilingual (বাংলা Bengali default & English).

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js >= 18.20.0
- npm >= 9.0.0

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database & Seed Data
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to SQLite local database
npm run db:push

# Populate authentic Bengali seed data
npm run db:seed
```

### 4. Start Development Servers
In separate terminals or concurrently:
```bash
# Start Backend API (Port 4000)
npm run dev:api

# Start Frontend Web PWA (Port 5173)
npm run dev:web
```

Visit: **http://localhost:5173/**

### Seed User Credentials
- **Admin User**: `admin@agomoni.in` / `AgomoniAdmin2026!`
- **Sample User**: `riya.sen@example.com` / `PujaVibe2026!`
- **Sample User**: `anirban.m@example.com` / `PujaVibe2026!`

---

## 🧪 Testing

Run backend unit and integration tests:
```bash
npm run test --workspace=apps/api
```

Build production bundles:
```bash
npm run build
```

---

## 🐳 Docker Deployment

To launch the entire stack with PostgreSQL, Redis, API, and Nginx:
```bash
docker-compose up --build -d
```

---

## 📜 Documentation Index
- [ARCHITECTURE.md](file:///home/suman/Desktop/Mern%20Stack%20Projects/Agomoni/ARCHITECTURE.md) — Technical specifications & data flows.
- [SECURITY.md](file:///home/suman/Desktop/Mern%20Stack%20Projects/Agomoni/SECURITY.md) — Security model, OWASP compliance, and threat mitigation.
- [API.md](file:///home/suman/Desktop/Mern%20Stack%20Projects/Agomoni/API.md) — Complete REST & Socket.IO API specification.
- [DEPLOYMENT.md](file:///home/suman/Desktop/Mern%20Stack%20Projects/Agomoni/DEPLOYMENT.md) — Production deployment instructions & checklist.
