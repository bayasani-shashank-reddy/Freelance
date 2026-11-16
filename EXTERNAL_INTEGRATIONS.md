# NEXUSCRAFT VERSION 2.0 — EXTERNAL INTEGRATIONS STATUS
**Date:** November 16, 2026  
**Auditor / Architect:** Principal Full-Stack Engineer  

This document tracks all external API services, credentials, and adapter configurations.

| Integration | Purpose | Configuration Status | Fallback / Development Mode |
|:---|:---|:---:|:---|
| **Google Gemini API** | AI Blueprint & Scoping | Configured (`GEMINI_API_KEY`) | Heuristic scoping engine when key missing or rate-limited |
| **MongoDB Atlas** | Primary Database | Connected (`MONGODB_URI`) | Local MongoDB instance (`mongodb://localhost:27017/nexuscraft`) |
| **Stripe / Razorpay** | NCX Token Pack Top-Ups | Blocked (Requires Live Keys) | Secure adapter ready, mock checkout in dev mode without minting arbitrary tokens |
| **AWS S3 / Cloudflare R2** | Cloud Object Storage | Optional / Configurable | Local disk storage (`server/uploads/deliverables`) as dev fallback |
| **ClamAV / Antivirus** | Malware Scanning on ZIPs | Pending Daemon | Heuristic inspection (Zip bomb, path traversal, executable extension blocks) |
| **Resend / SendGrid** | Transactional Emails | Blocked (Requires API Key) | Console logging transporter (`Nodemailer` test account / console mock) |
| **Socket.IO** | Real-Time Events & Chat | Ready to Mount | In-memory Socket.IO server on Express port 5000 |
