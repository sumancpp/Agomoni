# 🌺 AGOMONI — API Specification (`/api/v1`)

## Authentication (`/api/v1/auth`)
- `POST /register`: Create account. Body: `email`, `password`, `displayName`, `dateOfBirth` (YYYY-MM-DD, age >= 18), `gender`, `locationCity`.
- `POST /login`: Authenticate. Returns JWT token and user profile.
- `GET /me`: Fetch authenticated user profile, availabilities, interests, and entitlements.
- `DELETE /account`: Trigger complete account and personal data deletion.

## User Profile (`/api/v1/profile`)
- `GET /`: Fetch profile, Puja days/slots, and interests.
- `PATCH /`: Update displayName, bio, location, preferences, `hideProfile`, `isMatchingActive`.
- `GET /interests`: Public catalog of festive interests.

## Puja Date (`/api/v1/dating`)
- `GET /feed`: Discovery feed of candidates with Vibe Match percentage, shared interests, and match highlights (18+ only).
- `POST /like`: Send match request / like. Automatically creates conversation on mutual like.

## Real-Time Chat (`/api/v1/chat`)
- `GET /conversations`: List active conversations, last message, unread count, and free chats remaining.
- `POST /conversations`: Unlock/create a conversation with target user. Returns HTTP 402 if 3 free chats used and user lacks unlimited entitlement.
- `GET /conversations/:id/messages`: Paginated message history.
- `POST /conversations/:id/messages`: Send message (persists to DB and broadcasts via Socket.IO).
- `POST /block`: Block target user from matching and messaging.
- `POST /report`: Submit moderation report for harassment or abuse.

## Payments (`/api/v1/payments`)
- `GET /products`: Catalog of products (`PUJA_DATE_UNLIMITED_CHAT` ₹49, `LOST_FOUND_POST` ₹29).
- `GET /entitlements`: List active entitlements for the authenticated user.
- `POST /order`: Generate Razorpay order for product.
- `POST /verify`: Verify HMAC-SHA256 signature and grant entitlement in transaction.
- `POST /webhook`: Razorpay server webhook receiver for automated captures.

## Lost & Found (`/api/v1/lost-found`)
- `GET /`: Active listings with optional `category` filter and text search.
- `POST /`: Create listing (validates ₹29 fee, runs heuristic match detection, sends notifications).
- `GET /:id/matches`: View possible matches detected for a listing.

## Memory Capsule (`/api/v1/memories`)
- `GET /`: Private festive timeline logs (Mahalaya to Dashami).
- `POST /`: Create memory entry (photo, mood, note, location).
- `POST /:id/share`: Toggle public shareable link with unguessable token.
- `GET /shared/:token`: Public view for shared memory.
- `DELETE /:id`: Delete memory.

## Emergency (`/api/v1/emergency`)
- `GET /directory`: Verified national helplines (112, 100, 108) and local hospitals/police.
- `GET /contacts`: User's private emergency contacts list.
- `POST /contacts`: Add emergency contact.
- `DELETE /contacts/:id`: Delete emergency contact.

## Puja Music (`/api/v1/music`)
- `GET /playlists`: Active playlists with tracks.
- `GET /tracks`: Tracks by category (`AGOMONI`, `MAHALAYA`, `DHAK`, `PUJA_SONGS`, `AMBIENT`).
- `POST /tracks`: Admin only: Add track with whitelisted embed URL.

## Calendar (`/api/v1/calendar`)
- `GET /active`: Configurable Puja dates (Mahalaya -> Dashami) with live countdown calculation.
- `POST /`: Admin only: Update festival calendar dates.

## Admin (`/api/v1/admin`)
- `GET /analytics`: Overview metrics (users, revenue, orders, posts, generations, reports).
- `GET /reports`: Moderation queue.
- `POST /reports/:id/resolve`: Resolve report or ban offending user.
- `GET /users`: User directory and entitlement audit.
