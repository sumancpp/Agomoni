# 🌺 AGOMONI — Production Deployment Guide

## 1. Environment Preparation

1. Generate secure random secrets for production:
   ```bash
   openssl rand -hex 32 # For JWT_SECRET
   openssl rand -hex 32 # For JWT_REFRESH_SECRET
   ```
2. Configure production `.env` with:
   - `NODE_ENV=production`
   - `DATABASE_URL`: PostgreSQL connection string with SSL enabled
   - `REDIS_URL`: Production Redis instance
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`
   - `CLIENT_URL`: Domain of your production web app (e.g. `https://agomoni.in`)

## 2. Database Migration & Seed
Run migrations against the production PostgreSQL instance:
```bash
npx prisma migrate deploy --schema=src/prisma/schema.prisma
npm run db:seed
```

## 3. Production Docker Launch
Using Docker Compose:
```bash
docker-compose -f docker-compose.yml up --build -d
```

## 4. Verification Checklist
- [ ] Health check returns 200 OK at `/health`.
- [ ] Active countdown returns 200 OK at `/api/v1/calendar/active`.
- [ ] WebSocket connections establish successfully on `/socket.io`.
- [ ] Razorpay webhook URL configured in Razorpay Dashboard: `https://api.agomoni.in/api/v1/payments/webhook`.
- [ ] SSL/TLS certificate configured on port 443 with HSTS.
- [ ] Service worker registers and installs PWA on mobile devices.
