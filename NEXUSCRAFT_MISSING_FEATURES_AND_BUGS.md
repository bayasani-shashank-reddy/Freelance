# NEXUSCRAFT VERSION 2.0 — PRIORITY BUG & GAP REPORT
**Platform:** NexusCraft — *From Idea to Reality*  
**Date:** November 16, 2026  
**Auditor:** Principal Full-Stack Software Auditor & QA Specialist  
**Coverage:** 135-Feature Audit Gaps, Architectural Shortcuts, and Security Vulnerabilities  

---

## 1. Critical Priority (Security, Authentication & Financial Integrity)

### Critical Issue 1: Plaintext Passwords & Absence of BCrypt Hashing
- **Feature ID:** ID 3 (bcrypt password hashing)
- **Problem:** Passwords submitted during registration are saved directly as plaintext strings in MongoDB. Authentication compares passwords via plain string equality (`user.password === password`).
- **Impact:** High-severity security risk. Any unauthorized read access to the MongoDB cluster exposes client, specialist, and administrator credentials in the clear.
- **Root Cause:** Neither `bcrypt` nor `argon2` is installed in `server/package.json`. The master demo password bypass in `server/routes/authRoutes.js` (lines 136-144) was implemented without pre-save hashing middleware.
- **Suggested Correction:** Install `bcryptjs`. Add a Mongoose pre-save hook on `UserSchema` to hash passwords with salt rounds $\ge 12$. Update `authRoutes.js` to call `await bcrypt.compare(password, user.password)`.
- **Dependencies:** `bcryptjs` package, database migration script to hash existing seeded passwords.

---

### Critical Issue 2: Unverified Token Top-Up Endpoint
- **Feature ID:** ID 8 (/api/credits/topup verification) & ID 124 (Payment gateway for NCX top-ups)
- **Problem:** `POST /api/credits/topup` accepts any arbitrary `{ tokens, amountPaid }` payload and credits the tokens directly to the database without payment verification.
- **Impact:** Financial exploit vulnerability. Any authenticated or unauthenticated client can mint arbitrary NCX tokens for free by sending a direct HTTP POST request with `{ tokens: 1000000, amountPaid: 1 }`.
- **Root Cause:** The endpoint was created as a development mock in `server/routes/creditRoutes.js` (lines 94-118) to support frontend UI development without requiring live Stripe/Razorpay keys.
- **Suggested Correction:** Integrate Stripe / Razorpay SDKs. When a client initiates a top-up, create a payment order/intent on the provider. Only credit NCX tokens upon receiving a cryptographically verified webhook event (`checkout.session.completed` or Razorpay signature verification).
- **Dependencies:** Payment gateway account (Stripe secret key / Razorpay key secret), webhook routing.

---

### Critical Issue 3: Absence of JWT Access & Refresh Token Flow
- **Feature ID:** ID 2 (Login with JWT authentication) & ID 10 (Refresh-token rotation)
- **Problem:** The backend does not issue JSON Web Tokens (JWTs) or refresh tokens. The login route returns the raw user document, which the frontend stores in plain `localStorage`.
- **Impact:** Vulnerable to Cross-Site Scripting (XSS) session theft. No expiration, revocation, or token rotation mechanism exists.
- **Root Cause:** `jsonwebtoken` is not installed or utilized in the Express server.
- **Suggested Correction:** Install `jsonwebtoken`. On login, issue a short-lived access token (15 minutes) in memory/header and a signed, `httpOnly`, `SameSite=Strict` refresh token cookie. Implement `POST /api/auth/refresh` and an authentication middleware (`verifyToken`) on all protected Express routes.
- **Dependencies:** `jsonwebtoken`, `cookie-parser`.

---

### Critical Issue 4: Non-Atomic Financial & Intake Operations (Lack of MongoDB Transactions)
- **Feature ID:** ID 25 (50 NCX deduction on submission), ID 113 (NCX token ledger) & ID 114 (Escrow)
- **Problem:** Project intake and credit deductions are executed as separate sequential Mongoose calls (`newRequest.save()`, then `user.save()`, then `tx.save()`).
- **Impact:** Potential financial inconsistency. If the server crashes or MongoDB encounters a network hiccup between `newRequest.save()` and `user.save()`, the project is created without debiting the client's balance, or vice versa.
- **Root Cause:** Multi-document sessions (`mongoose.startSession()`) are not utilized in `server/routes/projectRoutes.js` (lines 207-224).
- **Suggested Correction:** Wrap the project creation, wallet balance debit, and `CreditTransaction` insertion in a Mongoose replica-set transaction block (`session.withTransaction`).
- **Dependencies:** MongoDB replica set (MongoDB Atlas already supports multi-document transactions).

---

### Critical Issue 5: Hardcoded Plaintext Demo Credentials in Documentation & Frontend Source
- **Feature ID:** ID 15 of Security Checklist / ID 14 of Catalogue
- **Problem:** Plaintext admin and demo credentials (`admin@nexuscraft.com` / `Admin@12345`, `client@example.com` / `Client@12345`) are published directly in `nexuscraft_complete_overview.md` and hardcoded in `src/context/UserContext.tsx` (`SEED_ACCOUNTS`).
- **Impact:** Exposes platform access rules in repository history and client-side JavaScript bundles.
- **Root Cause:** Legacy demo login aids left in source files for convenient development switching.
- **Suggested Correction:** Remove all hardcoded password strings from `UserContext.tsx`. Use environment variables or a local `.env.example` file for demo instructions, and strip credential tables from public-facing documentation.
- **Dependencies:** None.

---

## 2. High Priority (Workflow Integrity, Storage & Permissions)

### High Issue 1: Local Disk Storage for ZIP Deliverables (No Object Storage)
- **Feature ID:** ID 101 (ZIP deliverable upload) & ID 72 (ZIP Inspector vault)
- **Problem:** Uploaded deliverable ZIP packages are saved directly to the local server filesystem (`server/uploads/deliverables/`).
- **Impact:** Ephemeral storage failure. When deployed to containerized or serverless hosting (e.g. Render, Railway, AWS ECS, or Vercel), local disk storage is wiped upon every redeployment or container restart, resulting in permanent loss of uploaded client deliverables.
- **Root Cause:** `multer.diskStorage` is pointed to a local directory in `server/routes/deliverableRoutes.js` (lines 20-29).
- **Suggested Correction:** Transition `multer` to memory storage or an S3-compatible cloud storage adapter (AWS S3, Cloudflare R2, or Google Cloud Storage) and generate time-limited pre-signed URLs for deliverable downloads.
- **Dependencies:** S3-compatible storage bucket and access credentials (`@aws-sdk/client-s3`).

---

### High Issue 2: Heuristic Zip Inspection Only (Absence of Real Antivirus Engine)
- **Feature ID:** ID 72 (Deliverables and ZIP Inspector vault) & ID 100 (Submission Readiness Inspector)
- **Problem:** The server inspects ZIP archives using `adm-zip` for path traversal patterns (`..`) and banned extensions (`.exe`, `.bat`), but performs no genuine signature or heuristic malware scanning.
- **Impact:** Risk of distributing malicious packages to clients upon deliverable release.
- **Root Cause:** No antivirus daemon or malware scanning API (e.g. ClamAV, VirusTotal API) is integrated into the upload pipeline.
- **Suggested Correction:** Integrate an asynchronous scanning worker (e.g., ClamAV Docker sidecar or VirusTotal API) that evaluates the archive buffer before moving it to the verified deliverable state.
- **Dependencies:** ClamAV container or VirusTotal API key.

---

### High Issue 3: Simulated Milestone Escrow Locks (No True Escrow Balance Isolation)
- **Feature ID:** ID 38 (Milestone escrow lock visibility), ID 75 (Escrow release control) & ID 114 (Escrow on quotation approval)
- **Problem:** When an administrator approves a quotation or marks an escrow milestone as funded, the deliverable/quotation `escrowStatus` string is updated, but no tokens or fiat funds are actually deducted or locked in a segregated escrow reserve on the user's account.
- **Impact:** A client can approve a milestone quote and subsequently spend their wallet balance elsewhere before the specialist submits their deliverable.
- **Root Cause:** The `User` model only tracks a single scalar `credits` integer without an `escrowBalance` field.
- **Suggested Correction:** Add `escrowBalance` to the `User` schema. When a quotation milestone is accepted, atomically transfer the milestone amount from `credits` to `escrowBalance`. On deliverable acceptance, deduct from client `escrowBalance` and credit the specialist's wallet ledger.
- **Dependencies:** Schema update to `server/models/User.js` and `CreditTransaction.js`.

---

## 3. Medium Priority (AI Suite Completeness, Real-Time Features & Proposed Additions)

### Medium Issue 1: Missing Specialized AI Tools in Client Suite
- **Feature ID:** ID 20 (User persona generator), ID 21 (Monetisation model suggestions), ID 23 (Competitive analysis tool)
- **Problem:** The AI Assistant suite in `server/routes/aiAssistantRoutes.js` has 12 generic tools, but does not include dedicated tools for User Persona generation, Monetisation models, or Competitive analysis.
- **Impact:** Feature catalogue promise unfulfilled in the Client Portal.
- **Root Cause:** The 12 tools were built around general project scoping (`enhance_idea`, `gap_detector`, `technology_advisor`, etc.) without dedicated prompts for business personas and competitors.
- **Suggested Correction:** Add distinct cases (`persona_generator`, `monetization_architect`, `competitive_intelligence`) to `switch (tool)` in `aiAssistantRoutes.js` and expose them in the Client Dashboard AI selector.
- **Dependencies:** None (uses existing Gemini prompt engine).

---

### Medium Issue 2: Polling Only for Notifications & In-App Messaging Stub
- **Feature ID:** ID 125 (Real-time notifications via WebSockets) & ID 127 (In-app project chat)
- **Problem:** The platform relies on HTTP REST polling for notifications. In-app chat exists only as empty function stubs (`chatMessages: []`, `sendChatMessage: () => {}`).
- **Impact:** Users do not receive immediate notifications when blueprints are generated, quotations submitted, or deliverables uploaded without refreshing the browser.
- **Root Cause:** Neither `ws` nor `socket.io` has been implemented in the backend.
- **Suggested Correction:** Mount a Socket.IO gateway on the Express HTTP server. Broadcast events (`notification:new`, `project:status_change`, `message:send`) to room channels matching `userId` and `projectId`. Connect the React frontend via a `useSocket` hook.
- **Dependencies:** `socket.io` and `socket.io-client`.

---

### Medium Issue 3: Missing Public Content Pages (About, Contact Us, Blog)
- **Feature ID:** Section 3.1 of Improvement Plan
- **Problem:** While How It Works, Pricing, For Clients, For Specialists, Case Studies, Trust, and Status were created, dedicated pages for `/about`, `/contact`, and `/blog` do not exist.
- **Impact:** SEO and inbound marketing reach is reduced.
- **Root Cause:** Focused on the core platform intelligence and trust pages during initial sprint.
- **Suggested Correction:** Add `AboutPage.tsx`, `ContactUsPage.tsx`, and `BlogPage.tsx` under `src/pages/public/` and register them in `src/App.tsx`.
- **Dependencies:** None.

---

### Medium Issue 4: Missing SEO Infrastructure (Sitemap & Robots.txt)
- **Feature ID:** Section 3.2 of Improvement Plan
- **Problem:** `public/robots.txt` and `public/sitemap.xml` do not exist. Dynamic Open Graph meta tags per page are not configured.
- **Impact:** Search engine bots cannot crawl the platform pages systematically.
- **Root Cause:** Static files were not generated in the `public/` directory.
- **Suggested Correction:** Add `robots.txt` and `sitemap.xml` in `public/` listing all 10 public marketing routes. Install `react-helmet-async` to emit per-page `<title>` and `og:image` tags.
- **Dependencies:** `react-helmet-async`.

---

## 4. Low Priority (Cosmetic, Responsive & Empty Handlers)

### Low Issue 1: Hardcoded SLA Radar Thresholds
- **Feature ID:** ID 85 (Configurable SLA thresholds and escalation rules)
- **Problem:** SLA breach times are hardcoded at 48 hours for scoping, 72 hours for specialist assignment, and 24 hours for deliverable verification in `src/components/admin/NexusSlaRadar.tsx`.
- **Impact:** Administrators cannot adjust SLA parameters without modifying frontend source code.
- **Root Cause:** Hardcoded constants in React component rather than database-backed platform settings.
- **Suggested Correction:** Store SLA thresholds in a `PlatformSetting` MongoDB collection and expose an admin slider in `/admin/settings`.
- **Dependencies:** Platform settings collection.

---

### Low Issue 2: Manual Hour Logging Only (No Live Stopwatch)
- **Feature ID:** ID 109 (Built-in time tracker with timer)
- **Problem:** The specialist effort tracker modal allows inputting hours worked manually, but has no live start/pause/stop stopwatch timer.
- **Impact:** Minor specialist UX limitation.
- **Suggested Correction:** Add a standard client-side stopwatch state in `EffortTrackerModal.tsx` that increments elapsed seconds and populates the hour input automatically.
- **Dependencies:** None.
