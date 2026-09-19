# 🌺 AGOMONI — আগমনী

> **"এই পুজোয়, কিছু মানুষ আপন হোক।"**  
> *"Celebrate. Connect. Remember. Stay Safe."*

AGOMONI (আগমনী) is a production-ready, full-stack Progressive Web App (PWA) that blends Bengali Durga Puja culture, pandal companion discovery (18+), lost & found assistance, digital memory capsules, emergency safety helplines, live festive calendars, and an authentic 113-track music streaming experience with real-time chat and Razorpay payments.

---

## 🌟 Core Features & Pillars

### 1. 🎵 113-Track Festive Audio Suite & Sync Engine
- **113 Curated Authentic Songs**: 5 handpicked playlists spanning all moods of Durga Puja:
  - 🪔 **Sacred Mahalaya & Chandipath** (*মহালয়া ও চণ্ডীপাঠ — বীরেন্দ্রকৃষ্ণ ভদ্র*)
  - 🎵 **Grand Durga Puja Hits & Anthems** (*পূজোর সেরা গান ও উৎসবের সুর*)
  - 🥁 **Traditional Dhak, Dhunuchi & Aarti** (*ঐতিহ্যবাহী ঢাক ও ধুনুচি নাচ*)
  - 🌺 **Timeless Agomoni Classics** (*চিরন্তন আগমনী ও ভক্তিমূলক গান*)
  - 🌙 **Serene Autumn Evening & Ambient Melodies** (*শরতের স্নিগ্ধ সুর ও স্মৃতি*)
- **Exact Runtime Synchronization**: All 113 tracks calibrated against verified YouTube metadata. Eliminates artificial premature song cutoffs and runaway progress bars.
- **True Pause/Resume Preservation**: Retains the exact second timestamp upon pause (e.g. pausing at `1:35` and resuming plays immediately from `1:35`, never restarting from `0:00`).
- **Persistent Global Player**: Survives page navigations with a floating Mini-Player and an expandable Full-Screen Modal featuring interactive scrubbers, volume controls, and track queue drawers.
- **Safety Audio Interlock**: Automatic `pauseForEmergency()` switch that mutes or pauses audio immediately when opening emergency helplines.

---

### 2. ❤️ Puja Date (18+ Companion Discovery)
- **Age-Verified (18+) Companion Matching**: Discover genuine companions for pandal hopping, food walks, and cultural gatherings.
- **Multi-Factor Vibe Match Algorithm**: Calculates compatibility scores (50%–99%) based on:
  - Puja Day Overlap (Shashti through Dashami)
  - Preferred Time Slots (Morning, Afternoon, Evening, Late Night)
  - Location Proximity & Neighborhood matching
  - Shared Interests (Food, Photography, Music, Dhunuchi Dance, Art, Fashion)
- **Privacy First**: Masked profile cards protecting user identity until mutual connection.
- **3 Free Conversation Unlocks**: Every user receives 3 complimentary conversation unlocks to connect and chat before requiring any payment.
- **Unlimited Chat Unlock**: ₹49 one-time Razorpay payment unlocks unlimited conversations for the entire festive season.
- **Real-Time Messaging**: Built on Socket.IO WebSockets with live typing indicators, delivered/read receipts, and online presence indicators.

---

### 3. 🧒 Puja Lost & Found ("পুজোয় হারিয়ে গেলে খুঁজে দিন")
- **Community Safety Portal**: Report lost or found children, family members, elderly citizens, and valuable belongings during crowded pandal visits.
- **Anti-Spam Verification**: ₹29 publication order via Razorpay to deter fraudulent claims and ensure serious community attention.
- **Heuristic "Possible Match" Engine**: Automatically analyzes location, category, date, and descriptions to detect and highlight matching Lost and Found notices.
- **Masked Poster Privacy**: Secure inquiry system protects personal contact numbers while enabling verified citizen coordination.
- **Admin Moderation**: Dedicated admin review pipeline to approve, resolve, or flag reports.

---

### 4. 📦 Puja Memory Capsule ("My Puja 2026")
- **100% Free Digital Festive Diary**: Capture and organize festive memories chronologically across the Puja timeline:
  - *Mahalaya ➔ Maha Shashti ➔ Maha Saptami ➔ Maha Ashtami ➔ Maha Nabami ➔ Bijoya Dashami*
- **Rich Media & Reflections**: Upload festival photographs, log daily moods, note pandal visits, and write reflections.
- **Cryptographic Share Links**: Private by default. Generates unguessable, tokenized public links that can be shared with family and revoked at any time.

---

### 5. 🚨 Puja Emergency & Safety Directory
- **1-Tap SOS Access**: Instant emergency assistance with optional, user-consented GPS geolocation sharing.
- **Verified West Bengal Helplines**:
  - National Emergency: `112`
  - Kolkata / WB Police: `100`
  - Medical Ambulance: `108`
  - Fire & Rescue: `101`
  - Women Helpline: `1090`
  - Childline Support: `1098`
- **Hospital Directory**: Quick-dial emergency contacts and directions for premier hospitals across Kolkata and suburbs.
- **Personal Emergency Contacts**: Securely store and quickly alert designated personal emergency contacts.
- **Emergency Music Mute**: Instant toggle to silence all background festive music when placing urgent calls.

---

### 6. 📅 Durga Puja 2026 Festive Calendar & Tithi Tracker
- **Authentic Puja Timeline**: Displays Tithi timings, auspicious rituals, pushpanjali muhurat, and sandhi puja schedules from Mahalaya to Bijoya Dashami.
- **Dynamic Active Day Indicator**: Real-time highlighting of the current active festival day with festive countdowns.

---

### 7. ✨ Enter Puja Mode (Interactive Canvas)
- **Immersive Festive Atmosphere**: Interactive HTML5 particle simulation layered smoothly beneath application views.
- **Festive Elements**: Generates floating Shiuli flowers, glowing Diya flames, and fragrant Dhunuchi smoke particles that respond to user interaction.

---

### 8. 👥 Real Active Visitors Presence Tracker
- **Real-Time Presence Heartbeat**: In-memory session tracking (`/api/v1/stats/live-users`) reflecting 100% authentic, real active visitors currently browsing the platform.

---

### 9. 📱 Progressive Web App (PWA) & Offline Resilience
- **Installable Native-Like Experience**: Supports installation on iOS, Android, and Desktop via Web App Manifest and Service Worker precaching.
- **Custom Bengali Offline Experience**: Beautifully styled Bengali offline page (`offline.html`) with automatic reconnection listeners and dynamic reload triggers when network connectivity resumes.
- **SPA Navigation Fallback**: Ensures deep routes resolve reliably without offline white-screen errors.

---

### 10. 🛡️ Admin Moderation Panel
- **Dedicated Administrative Dashboard** (`/admin`): Restricted to verified platform administrators (`admin@agomoni.in`).
- **Control & Metrics**:
  - Live system statistics (active users, registered profiles, dating connections).
  - Lost & Found publication approvals and status tracking.
  - User verification and content moderation.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, TanStack Query v5, Framer Motion, Lucide React, Canvas API |
| **PWA & Offline** | Vite PWA Plugin, Workbox, Service Worker precaching, Web App Manifest |
| **Audio Engine** | YouTube IFrame PostMessage API, HTML5 Audio API, custom playback state coordinator |
| **Backend API** | Node.js, Express.js, TypeScript, Socket.IO, Helmet, Compression, Morgan, Express Rate Limit, Multer |
| **Database & ORM** | Prisma ORM, PostgreSQL (Production) / SQLite (Local Dev & Testing) |
| **Realtime & Cache** | WebSockets (Socket.IO), Redis (Production) / In-Memory Store (Dev) |
| **Payments** | Razorpay SDK (Orders, Verification, Webhooks, HMAC-SHA256 signature checks) |
| **Typography & i18n** | Bilingual (বাংলা Bengali & English), Google Fonts (*Noto Serif Bengali*, *Cinzel*, *Inter*) |

---

## 📁 Repository Structure

```
Agomoni/
├── apps/
│   ├── api/                    # Node.js + Express + Socket.IO Backend
│   │   ├── src/
│   │   │   ├── common/         # Auth, error, and validation middlewares
│   │   │   ├── config/         # Environment configurations
│   │   │   ├── modules/        # Domain modules (auth, dating, chat, music, etc.)
│   │   │   │   ├── admin/      # Admin moderation & system stats
│   │   │   │   ├── calendar/   # Durga Puja 2026 calendar & tithi data
│   │   │   │   ├── chat/       # Real-time WebSocket messaging
│   │   │   │   ├── dating/     # Puja Date Vibe Match algorithm & profiles
│   │   │   │   ├── emergency/  # Helplines and hospital directory
│   │   │   │   ├── lost-found/ # Lost & Found postings & match engine
│   │   │   │   ├── memory/     # Festive memory capsules & share tokens
│   │   │   │   ├── music/      # Curated playlist endpoints
│   │   │   │   └── payments/   # Razorpay order generation & verification
│   │   │   ├── prisma/         # Prisma schema and seed scripts
│   │   │   ├── app.ts          # Express application setup & middleware
│   │   │   └── server.ts       # HTTP & WebSocket server entrypoint
│   │   └── test/               # Jest & Supertest integration test suite
│   │
│   └── web/                    # React 18 + Vite + Tailwind PWA Frontend
│       ├── public/             # PWA assets, icons, offline.html fallback
│       └── src/
│           ├── components/     # Reusable layout, music, and feature components
│           ├── context/        # MusicPlayer, Language, and Auth contexts
│           ├── data/           # 113 curated tracks & festival calendar data
│           ├── pages/          # Application views (Home, Date, Songs, Memory, etc.)
│           └── lib/            # API client & utility functions
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: `>= 18.20.0`
- **npm**: `>= 9.0.0`

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/sumancpp/Agomoni.git
cd Agomoni
npm install
```

### 3. Setup Environment Variables
Create `.env` in the project root (or copy from `.env.example`):
```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"
JWT_SECRET="agomoni-festive-secret-key-2026"
RAZORPAY_KEY_ID="rzp_test_mock_key"
RAZORPAY_KEY_SECRET="rzp_test_mock_secret"
```

### 4. Setup Database & Seed Curated Data
```bash
# Generate Prisma client
npm run db:generate

# Push schema to local SQLite database
npm run db:push

# Seed authentic playlists (113 tracks), calendar, and admin account
npm run db:seed
```

> **Admin Account**: `admin@agomoni.in` / `AgomoniAdmin2026!`

### 5. Start Development Servers
Run both backend and frontend concurrently:
```bash
# Start backend API (Port 4000)
npm run dev:api

# Start frontend PWA (Port 5173)
npm run dev:web
```

Visit the app in your browser: **`http://localhost:5173/`**

---

## 🧪 Testing & Verification

Run the test suite:
```bash
# Run backend unit and integration tests
npm run test --workspace=apps/api

# Run TypeScript build verification
npm run build
```

---

## 🔒 Security & Privacy

- **Data Privacy**: Raw GPS coordinates are never exposed; proximity is matched via approximate city/neighborhood coordinates.
- **Payment Verification**: All Razorpay transactions use HMAC-SHA256 signature verification before activating features.
- **Masked Contacts**: Lost & Found submissions keep poster details confidential until verified inquiries are made.
- **XSS & Rate Limiting**: Secured with Helmet HTTP headers, sanitized inputs, and IP rate-limiting.

---

## 📜 Documentation Index

- [ARCHITECTURE.md](file:///home/suman/Desktop/Mern%20Stack%20Projects/Agomoni/ARCHITECTURE.md) — Technical specifications, data flow diagrams, and architectural decisions.
- [API.md](file:///home/suman/Desktop/Mern%20Stack%20Projects/Agomoni/API.md) — REST & Socket.IO endpoint documentation.
- [SECURITY.md](file:///home/suman/Desktop/Mern%20Stack%20Projects/Agomoni/SECURITY.md) — Security model, OWASP compliance, and threat mitigation.
- [DEPLOYMENT.md](file:///home/suman/Desktop/Mern%20Stack%20Projects/Agomoni/DEPLOYMENT.md) — Production deployment instructions for Vercel, Render, and Docker.

---

## 🌺 শুভ শারদীয়া — Celebrate Durga Puja with AGOMONI
Built with cultural pride and modern engineering.  
*জয় মা দুর্গা!*
