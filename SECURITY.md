# 🌺 AGOMONI — Security Model & OWASP Compliance

Agomoni treats security and personal safety as non-negotiable core pillars.

## 1. Authentication & Age Verification
- **Strict Server-Side 18+ Verification**: Evaluates exact birthdate math (`currentDate - dateOfBirth >= 18`). Prevents underage access to dating discovery and chats.
- **Argon2 / Secure Bcrypt**: Passwords hashed with salted bcrypt rounds (12 rounds in registration). Plaintext passwords are never logged or stored.
- **JWT With Refresh Strategy**: Secure short-lived access tokens with cryptographic verification and revocation on account deletion.

## 2. Privacy & Data Minimization
- **No Raw GPS Exposure**: Approximate city/neighborhood names and rounded distances (e.g. `~3 km away`) are computed server-side. Precise latitude and longitude are never returned in public profile feeds.
- **Masked Contact Relays**: In Lost & Found, contact mechanisms are mediated in-app or via masked relays to shield personal phone numbers from scraper bots and scammers.
- **Unguessable Tokens for Shared Memories**: Public memory URLs rely on 128-bit cryptographically secure random hexadecimal tokens (`crypto.randomBytes(16)`), preventing sequential enumeration or IDOR.
- **Complete Account Deletion**: Users can invoke complete data erasure, which anonymizes email records, cascades removal of profile discovery, and purges personal contacts.

## 3. Web & Network Defenses
- **Helmet Security Headers**: Configures strict Content-Security-Policy, anti-clickjacking (`X-Frame-Options`), and `X-Content-Type-Options: nosniff`.
- **Rate Limiting**: Express rate limiters protect auth endpoints and chat flooding.
- **XSS Prevention**: User chat messages are stripped of raw HTML brackets (`<` and `>`) and rendered cleanly in sanitized React text elements.
- **File Upload Protection**: Validates MIME types (JPEG, PNG, WebP only), enforces a 5MB size limit, stores files with random UUIDs, and executes no uploaded code.

## 4. Payment Integrity
- **Backend as Source of Truth**: Pricing (₹49 for Chat, ₹29 for Lost & Found, ₹29 for Outfit) is defined exclusively in the backend `PRODUCTS` catalog.
- **HMAC-SHA256 Signature Verification**: Validates Razorpay signature on both client payment returns and asynchronous webhook events before granting entitlements.
- **Idempotency**: Prevents duplicate entitlement allocations across retries.
