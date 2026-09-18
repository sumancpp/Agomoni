# 🌺 AGOMONI — System Architecture & Design

## 1. High-Level Architecture

```mermaid
graph TD
    Client[Progressive Web App (React + Vite + Tailwind)]
    API[Node.js Express TypeScript API Gateway]
    Socket[Socket.IO Gateway - Realtime Messaging]
    DB[(Prisma ORM - PostgreSQL / SQLite)]
    Rzp[Razorpay Payments Gateway]
    AI[AI Provider Abstraction (OpenAI / Gemini / Mock)]
    Audio[Global Persistent Audio Experience Layer]

    Client -->|REST API /api/v1| API
    Client -->|WebSocket| Socket
    Client -->|Continuous Audio Playback| Audio
    API -->|Prisma Client| DB
    Socket -->|Persistence & Presence| DB
    API -->|Orders & Webhooks| Rzp
    API -->|Prompt & Image Synthesis| AI
```

## 2. Core Subsystems

### 2.1 Global Music Experience Layer
- **Persistent Player Context**: Lives at the root provider layer, completely decoupled from page route changes.
- **Dual Engine**:
  - Native HTML5 Audio for bundled royalty-free festive soundscapes (Dhak, Shehnai, Chants), enabling continuous uninterrupted playback while moving between Date, Lost & Found, and Memory tabs.
  - Official HTML Embed Player (YouTube/Spotify) inside an expandable modal to strictly comply with copyright and anti-scraping policies.
- **Safety Interlock**: Automatically exposes `pauseForEmergency()` to mute or pause music immediately upon entering the Emergency section.

### 2.2 Vibe Match Algorithm
The engine computes a multi-factor compatibility score normalized between 50% and 99%:
- **Puja Day Overlap (25%)**: Evaluates shared presence on Shashti, Saptami, Ashtami, Nabami, Dashami.
- **Time Slot Overlap (15%)**: Evaluates compatibility for Morning, Afternoon, Evening, Night, or All Day pandal hopping.
- **Location Proximity (20%)**: Uses approximate Haversine formula on neighborhood coordinates or city text match. Never exposes raw GPS coordinates to users.
- **Age Proximity (20%)**: Evaluates peer closeness within user preference bounds.
- **Shared Interests (15%)**: Overlap across Food, Photography, Music, Culture, Fashion, Art, etc.
- **Bio Warmth (5%)**: Depth of festive descriptions.

### 2.3 Entitlement & Paywall Engine
All entitlement checks are enforced strictly server-side:
- **Chat Gate**:
  - Tracks distinct conversation participant records for the user.
  - If `count >= 3`, verifies `PUJA_DATE_UNLIMITED_CHAT` entitlement. If absent, responds with HTTP 402 and product pricing.
- **Payment Verification**:
  - Uses HMAC-SHA256 signature verification over `orderId|paymentId` with `RAZORPAY_KEY_SECRET`.
  - Grants entitlements in atomic database transactions.
