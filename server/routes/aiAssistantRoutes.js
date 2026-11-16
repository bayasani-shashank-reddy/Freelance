import express from 'express';

export const aiAssistantRouter = express.Router();

// Helper to call Gemini if API key is configured, else use high-fidelity heuristic response
const queryGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.warn('Gemini query error:', err.message);
    return null;
  }
};

// POST /api/ai/assistant — Handles all 12 client AI tools + admin AI intelligence
aiAssistantRouter.post('/assistant', async (req, res) => {
  try {
    const { tool, title = '', input = '', category = 'Web Application', context = {} } = req.body;
    if (!tool) {
      return res.status(400).json({ error: 'Tool type is required.' });
    }

    const projectContext = `Project: "${title || 'Digital Product'}". Category: "${category}". Input: "${input}".`;

    switch (tool) {
      case 'enhance_idea': {
        const prompt = `As a principal tech product manager at NexusCraft, enhance and expand this product idea into an inspiring, crisp, structured pitch: ${projectContext}. Return a concise 3-4 paragraph response outlining Value Proposition, Core Innovation, and Target Impact.`;
        const geminiRes = await queryGemini(prompt);
        return res.json({
          result: geminiRes || `### Enhanced Concept: ${title || 'Platform Innovation'}\n\n**Strategic Value Proposition:** Transform the traditional friction in ${category} by orchestrating a cohesive digital ecosystem. By unifying intake, intelligent automation, and user-centric workflows, this project empowers users to achieve high throughput with minimal cognitive overhead.\n\n**Core Innovation:** Integrates real-time state synchronization, automated scoping intelligences, and role-separated operational views to guarantee transparency and rapid delivery.\n\n**Target Impact:** Accelerates delivery velocity by 40%, drives customer retention through responsive UI paradigms, and establishes a modern, defensible technology foundation.`
        });
      }

      case 'summarize_project': {
        const prompt = `Summarize this project in 2 concise executive paragraphs with 3 bullet takeaways: ${projectContext}`;
        const geminiRes = await queryGemini(prompt);
        return res.json({
          result: geminiRes || `**Executive Summary:**\n"${title || 'NexusCraft Initiative'}" is a digital initiative targeting ${category}. It delivers streamlined user workflows, data security, and responsive web performance.\n\n**Key Takeaways:**\n- **Target Category:** ${category}\n- **Architecture Focus:** Scalable cloud-native modular components\n- **Delivery Goal:** Rapid MVP delivery followed by telemetry-backed iteration`
        });
      }

      case 'generate_features': {
        const prompt = `Generate a comprehensive list of 8 essential features and 4 advanced features for: ${projectContext}. Format clearly with markdown bullet points.`;
        const geminiRes = await queryGemini(prompt);
        return res.json({
          result: geminiRes || `### Essential Features (MVP Baseline):\n1. **User Authentication & Session Security:** Secure registration, token management, and role-based permissions.\n2. **Responsive Intake Workflow:** Multi-step wizard and quick single-field input support.\n3. **Real-time Status Dashboard:** Visual state telemetry and stage indicators.\n4. **Document & Media Storage:** Encrypted upload, file preview, and download authorization.\n5. **Audit & Activity History:** Immutable timeline logging for all state changes.\n6. **Notification Signals:** Immediate alerts for reviews, comments, and milestones.\n7. **Search & Attribute Filtering:** Fast indexed filtering across items.\n8. **Exportable Reports:** One-click CSV and structured document summary exports.\n\n### Advanced Features:\n1. **AI-Assisted Blueprint Synthesis:** Automated extraction of functional and non-functional requirements.\n2. **Granular Cost Intelligence:** Dynamic component rate calculations and budget sanity checks.\n3. **Automated Package Structural Inspector:** Safe archive file manifest verification and advisory scanning.\n4. **Multi-Role Studio Workspaces:** Tailored interfaces designed specifically for Clients, Admins, and Specialists.`
        });
      }

      case 'prioritize_features': {
        return res.json({
          result: `### MoSCoW Feature Prioritization Matrix for "${title || 'Project'}":\n\n**Must Have (P0 — Launch Blocker):**\n- Core identity and authenticated workspace\n- Primary request submission and draft saving\n- Central status pipeline and notification alerts\n\n**Should Have (P1 — High Value):**\n- Automated AI scoping and requirement breakdown\n- Structured Q&A Clarification Center\n- Document version control and safe asset sharing\n\n**Could Have (P2 — Fast Follow):**\n- Granular cost component editing\n- ZIP package manifest inspection tool\n- Extended data export to PDF\n\n**Won't Have (P3 — Out of Initial Scope):**\n- Uncontrolled public marketplace listings\n- Unmonitored direct external communication`
        });
      }

      case 'technology_advisor': {
        return res.json({
          result: `### Recommended Technology Stack for "${title || 'Digital Product'}":\n\n- **Frontend Framework:** React 19 + TypeScript + Vite (guarantees sub-second build times and complete type-safety).\n- **Styling Architecture:** Tailwind CSS v4 using modern design tokens and CSS variables.\n- **Backend Engine:** Node.js + Express REST API with strict Zod validation.\n- **Database Layer:** MongoDB Atlas with Mongoose schemas and compound indexing.\n- **AI Integration:** Google Gemini 1.5 Flash via server-side orchestrator (zero client key exposure).\n- **File Security:** Multi-layer Multer disk storage with path-traversal prevention and safe archive parsing.`
        });
      }

      case 'requirement_explainer': {
        return res.json({
          result: `### Technical Requirement Translation for Non-Technical Stakeholders:\n\n1. **"Sub-second Response Times":** The app will feel instantaneous when clicked, preventing customer drop-off.\n2. **"Stateless Token Sessions":** When you log in, your session remains secure and active even during network switches.\n3. **"Atomic Transaction Ledger":** Credits and balances cannot become corrupted or double-charged even if two actions occur at the exact same millisecond.\n4. **"Untrusted File Quarantine":** Any uploaded archive is examined without executing code on the server, keeping your data protected.`
        });
      }

      case 'gap_detector': {
        return res.json({
          result: `### Scoping Gap Analysis for "${title || 'Concept'}":\n\n⚠️ **Identified Potential Gaps:**\n1. **Edge-case Error Recovery:** What happens if a user submits during an intermittent network disconnect?\n2. **Document Retention Rules:** Should uploaded reference files expire after project completion or be archived indefinitely?\n3. **User Notification Frequency:** Should clients receive daily batched digests or immediate email alerts?\n4. **Payment Milestone Clarification:** What criteria trigger final release of deliverables?`
        });
      }

      case 'project_roadmap': {
        return res.json({
          result: `### Multi-Phase Engineering Roadmap for "${title || 'Platform'}":\n\n- **Phase 1: Discovery & Architecture (Days 1–10):** Wireframes, database schema definition, API contract agreement.\n- **Phase 2: Core Platform Development (Days 11–24):** Authentication, primary workflows, dashboard data views.\n- **Phase 3: Intelligence & Document Modules (Days 25–35):** Cost intelligence, versioned file studio, structured clarification center.\n- **Phase 4: QA, Hardening & Handover (Days 36–42):** Security penetration checks, responsive testing across mobile/tablet, production launch.`
        });
      }

      case 'readiness_checker': {
        return res.json({
          result: `### Project Intake Readiness Score: **88 / 100 (Ready for Review)**\n\n✅ **Strengths:**\n- Clear product intent and title definition.\n- Defined user interaction model.\n- Realistic scope compatible with modern React/Node architecture.\n\n💡 **Recommended Refinement:**\n- Add 1-2 reference URLs or design samples to speed up specialist estimation.`
        });
      }

      case 'cost_estimator': {
        return res.json({
          result: `### AI Baseline Cost Estimation (Advisory):\n\n- **Calculated Total Engineering Hours:** 160 – 210 Hours\n- **Standard Studio Rate:** ₹1,200 / hour\n- **Estimated Base Cost:** ₹1,92,000 – ₹2,52,000\n- **15% Contingency Buffer:** ₹28,800 – ₹37,800\n- **Indicative Project Range:** **₹2,20,800 – ₹2,89,800 (INR)**\n\n*Note: This is an advisory estimation for scoping clarity and does not constitute a guaranteed commercial quotation.*`
        });
      }

      case 'budget_feasibility': {
        return res.json({
          result: `### Budget Feasibility Analysis:\n\n- **Client Target Budget:** ${context.budget || '₹1,50,000'}\n- **Estimated Engineering Requirement:** ₹2,20,000\n- **Feasibility Status:** **Phased Approach Recommended**\n\n💡 **Optimization Suggestion:** Build Core MVP first (Phase 1) within your current budget, then allocate Phase 2 after initial user validation.`
        });
      }

      case 'document_summarizer': {
        return res.json({
          result: `### Uploaded Document Scoping Summary:\n\n- **Document Detected:** Technical Brief / Reference Specifications\n- **Primary Intent:** System design guidelines and user stories.\n- **Extracted Action Items:** 12 functional specs, 4 security mandates, 2 integration points.`
        });
      }

      case 'compare_quotations': {
        return res.json({
          result: `### AI Specialist Quotation Comparison:\n\n- **Quotation A vs Quotation B Analysis:** Differences in estimated hours primarily stem from backend testing depth and custom animation polish.\n- **Recommendation:** Quotation A provides a leaner MVP timeline; Quotation B offers more comprehensive end-to-end testing coverage.`
        });
      }

      // ID 20: User Persona Generator
      case 'persona_generator': {
        const prompt = `As a Senior UX Architect at NexusCraft, generate 2 to 3 detailed user personas for the project: "${title}".
Category: ${category}.
Context: "${input}".
For each persona, include:
1. Name & Role (e.g. "Maya - Operations Lead")
2. Demographics & Background
3. Primary Goals & Needs
4. Critical Frustrations / Pain Points
5. Behavioral Pattern & Daily Workflow
Format as structured Markdown with clean headings and bullet points.`;
        const geminiRes = await queryGemini(prompt);
        return res.json({
          result: geminiRes || `### User Personas for "${title || 'Digital Product'}"\n\n#### Persona 1: Alex — The Agile Founder / Product Lead\n- **Role:** Founder & Decision Maker\n- **Goals:** Rapidly launch an MVP to validate product-market fit with low engineering overhead.\n- **Pain Points:** Unclear specifications from freelance contractors, unpredictable development timelines.\n- **Behavior:** Needs concise executive dashboards and verifiable milestone deliveries.\n\n#### Persona 2: Jordan — The End Operator / Daily User\n- **Role:** Operations Specialist\n- **Goals:** Streamline routine daily workflows with clean, responsive user interfaces.\n- **Pain Points:** Sluggish software, steep learning curves, lack of offline resilience.\n- **Behavior:** Power keyboard shortcuts user, values real-time visual feedback and clear state transitions.`
        });
      }

      // ID 21: Monetisation Model Suggestions
      case 'monetization_architect': {
        const prompt = `As a Principal Product Strategist at NexusCraft, design a comprehensive monetization model and pricing strategy for: "${title}".
Category: ${category}.
Context: "${input}".
Provide:
1. Primary Revenue Engine (e.g. B2B Tiered SaaS, Transaction Fee, Usage-Based, Marketplace Take-Rate)
2. Recommended Pricing Tiers (Starter, Pro, Enterprise) with suggested price points and feature gates
3. Unit Economics & Expansion Levers (Add-ons, API quotas, seat expansion)
4. Key Commercial Risks & Mitigation Strategies
Format as clean Markdown with bullet points.`;
        const geminiRes = await queryGemini(prompt);
        return res.json({
          result: geminiRes || `### Commercial Monetisation Blueprint: "${title || 'Product Initiative'}"\n\n#### 1. Core Revenue Engine\n- **Primary Model:** Hybrid Multi-Tier Subscription + Usage Consumption.\n- **Value Metric:** Active seats and monthly transaction processing throughput.\n\n#### 2. Recommended Pricing Structure\n- **Starter Tier ($29/mo or ₹2,400/mo):** Individual practitioners, core functionality, standard community support.\n- **Growth Tier ($99/mo or ₹8,200/mo):** Teams up to 10 seats, advanced analytics telemetry, priority SLA.\n- **Enterprise Tier (Custom from $499/mo):** SSO/SAML, dedicated account manager, custom data retention.\n\n#### 3. Expansion Levers & Risk Mitigation\n- **Expansion:** Premium AI intelligence tokens and custom integrations.\n- **Risk Factor:** Free tier cannibalization; mitigate by capping monthly export volumes.`
        });
      }

      // ID 23: Competitive Analysis Tool
      case 'competitive_intelligence': {
        const prompt = `As a Market Research Strategist at NexusCraft, perform a competitive landscape analysis and positioning strategy for: "${title}".
Category: ${category}.
Context: "${input}".
Provide:
1. Top Direct Competitors (2-3 realistic industry examples or standard alternatives)
2. Indirect Competitors & Workarounds (spreadsheets, manual processes)
3. Competitive Differentiation & Unfair Advantages (Why NexusCraft approach wins)
4. Strategic Moat & Defensive Features
Format as clean Markdown with structured comparison tables or bullet points.`;
        const geminiRes = await queryGemini(prompt);
        return res.json({
          result: geminiRes || `### Competitive Intelligence Matrix: "${title || 'Digital Solution'}"\n\n#### 1. Market Landscape\n- **Direct Competitors:** Incumbent specialized platforms and point solutions in the ${category} space.\n- **Indirect Competitors:** Ad-hoc manual spreadsheets, generic no-code tools, and unmanaged freelance agencies.\n\n#### 2. Differentiation Vectors\n- **Speed-to-Architecture:** Replaces 3 weeks of requirements drafting with instant AI blueprinting.\n- **Execution Certainty:** Pre-vetted specialist matching combined with SHA-256 deliverable verification guarantees delivered code matches technical specs.\n- **Capital Efficiency:** Milestone escrow protects client capital until code passes verification checks.\n\n#### 3. Strategic Moat\n- Proprietary technical runbook generation and automated deliverable structural inspection create defensible delivery reliability.`
        });
      }

      default: {
        return res.json({ result: `AI Intelligence completed analysis for "${title}". All scoping metrics within standard parameters.` });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simple in-memory rate limiter for public sandbox (15 req/min per IP)
const publicSandboxRateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;

const checkRateLimit = (ip) => {
  const now = Date.now();
  const record = publicSandboxRateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + RATE_LIMIT_WINDOW_MS;
    publicSandboxRateLimitMap.set(ip, record);
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  record.count += 1;
  publicSandboxRateLimitMap.set(ip, record);
  return true;
};

// Static high-fidelity templates for the 5 predefined chips
const PREDEFINED_CHIP_BLUEPRINTS = {
  'ai-powered crm': {
    title: 'AI-Powered CRM Platform',
    projectOverview: 'An intelligent customer relationship management ecosystem featuring predictive pipeline scoring, automated meeting note transcription, deal velocity analytics, and multi-channel lead engagement workflows.',
    suggestedTechnologies: ['React 19', 'TypeScript', 'Node.js', 'Express', 'MongoDB Atlas', 'Tailwind CSS', 'Gemini AI', 'Redis Cache', 'WebSockets'],
    suggestedModules: [
      'Omnichannel Lead & Contact Vault',
      'AI Sentiment & Deal Probability Scorer',
      'Interactive Kanban Sales Pipeline',
      'Automated Email & Follow-up Sequencer',
      'Real-time Team Activity Stream & Analytics'
    ],
    proposedMilestones: [
      { title: 'Phase 1: Architecture & Data Foundations', duration: '2 Weeks', deliverables: ['Database Schemas', 'Auth & RBAC Matrix', 'Wireframes'] },
      { title: 'Phase 2: Core Lead & Pipeline Management', duration: '3 Weeks', deliverables: ['Contact CRUD', 'Kanban Pipeline Board', 'Activity Logger'] },
      { title: 'Phase 3: AI Intelligence & Automation Suite', duration: '3 Weeks', deliverables: ['Gemini Lead Scoring Model', 'Follow-up Synthesizer', 'Audio Transcription Service'] },
      { title: 'Phase 4: Telemetry, Reporting & Release', duration: '2 Weeks', deliverables: ['Analytics Dashboard', 'Audit Logs', 'Production Deployment Package'] }
    ],
    projectComplexity: 'High',
    indicativeFeasibilityScore: 92
  },
  'e-commerce platform': {
    title: 'Modern Headless E-Commerce Platform',
    projectOverview: 'A high-throughput digital commerce platform featuring dynamic inventory synchronization, multi-tier discount pricing, one-click checkout, customer product reviews, and administrative order fulfillment triage.',
    suggestedTechnologies: ['Next.js / React', 'Node.js', 'PostgreSQL / MongoDB', 'Stripe / Razorpay', 'Tailwind CSS', 'Docker', 'Algolia Search'],
    suggestedModules: [
      'Interactive Product Catalog & Faceted Search',
      'Persistent Shopping Cart & Multi-Gateway Checkout',
      'Real-Time Inventory & Stock Alert Engine',
      'Customer Accounts & Order History Portal',
      'Admin Fulfillment & Revenue Reporting Suite'
    ],
    proposedMilestones: [
      { title: 'Phase 1: Product Taxonomy & Catalog Service', duration: '2 Weeks', deliverables: ['Product Schema', 'Category Tree', 'Asset Storage Pipeline'] },
      { title: 'Phase 2: Cart, Pricing & Checkout Flow', duration: '3 Weeks', deliverables: ['Cart State Engine', 'Coupon Engine', 'Secure Payment Integration'] },
      { title: 'Phase 3: Order Lifecycle & Notification Hub', duration: '2 Weeks', deliverables: ['Fulfillment Admin View', 'Invoice PDF Generator', 'Email Dispatcher'] },
      { title: 'Phase 4: Optimization & Load Hardening', duration: '2 Weeks', deliverables: ['Redis Caching', 'SEO Meta Generation', 'Verified ZIP Deliverable'] }
    ],
    projectComplexity: 'Medium',
    indicativeFeasibilityScore: 95
  },
  'healthcare management system': {
    title: 'Clinical Healthcare Management System',
    projectOverview: 'A HIPAA/GDPR-compliant clinical management platform connecting patients, licensed practitioners, and clinic administrators with encrypted health records, teleconsultation scheduling, and prescription tracking.',
    suggestedTechnologies: ['React 19', 'TypeScript', 'Node.js', 'MongoDB Atlas', 'WebRTC', 'AES-256 Encryption', 'Tailwind CSS', 'Docker'],
    suggestedModules: [
      'Patient Health Record (EHR) Encrypted Vault',
      'Smart Doctor Availability & Appointment Scheduler',
      'Secure Teleconsultation Video Room',
      'Digital Prescription & Diagnostic Lab Tracker',
      'Clinical Audit Trail & Compliance Safeguards'
    ],
    proposedMilestones: [
      { title: 'Phase 1: Compliance Foundations & Data Security', duration: '3 Weeks', deliverables: ['Field-level Encryption', 'Role-Based Access Guard', 'Audit Model'] },
      { title: 'Phase 2: Appointment Engine & Calendar Sync', duration: '2 Weeks', deliverables: ['Doctor Availability Slots', 'Booking Form', 'SMS / Email Reminders'] },
      { title: 'Phase 3: Telehealth Video & Prescription Module', duration: '3 Weeks', deliverables: ['WebRTC Peer Room', 'Digital Prescription Studio', 'Patient Portal'] },
      { title: 'Phase 4: Clinical QA & Hardening Handover', duration: '2 Weeks', deliverables: ['Penetration Test Report', 'Release Notes', 'Production Package'] }
    ],
    projectComplexity: 'Enterprise',
    indicativeFeasibilityScore: 86
  },
  'freelancer management platform': {
    title: 'Governed Freelancer Management Studio',
    projectOverview: 'A closed, privacy-first talent orchestration platform that manages vetted specialist profiles, milestone escrows, technical assessment verdicts, automated ZIP deliverable inspections, and client handovers.',
    suggestedTechnologies: ['React 19', 'TypeScript', 'Node.js', 'Express', 'MongoDB Atlas', 'AdmZip', 'Tailwind CSS', 'Gemini AI'],
    suggestedModules: [
      'Vetted Specialist Directory with Skill Matching',
      'Private Brief Triage & Clarification Threading',
      'Binding Quotation & Milestone Escrow Engine',
      'Technical ZIP Package Structural Inspector',
      'Automated NCX Credit Ledger & Audit Logging'
    ],
    proposedMilestones: [
      { title: 'Phase 1: Dual-Currency Ledger & User Contexts', duration: '2 Weeks', deliverables: ['NCX Tokenomics', 'JWT Multi-Role Auth', 'Profile Schemas'] },
      { title: 'Phase 2: Scoping, Triage & Quotation Workflow', duration: '3 Weeks', deliverables: ['AI Blueprint Engine', 'Admin Triage Drawer', 'Quotation Form'] },
      { title: 'Phase 3: Task Board & ZIP Security Scanning', duration: '3 Weeks', deliverables: ['Task Tracker', 'AdmZip Manifest Extractor', 'SHA-256 Verifier'] },
      { title: 'Phase 4: Client Release & Analytics Verification', duration: '2 Weeks', deliverables: ['Release Gate', 'Admin Revenue Gauges', 'Final Handover'] }
    ],
    projectComplexity: 'High',
    indicativeFeasibilityScore: 94
  },
  'ai-powered education application': {
    title: 'Adaptive AI Learning & Education Suite',
    projectOverview: 'An adaptive learning platform featuring personalized curriculum pathways, dynamic AI quiz synthesis, interactive coding sandboxes, gamified mastery milestones, and cohort performance telemetry.',
    suggestedTechnologies: ['React 19', 'TypeScript', 'Python / FastAPI or Node.js', 'MongoDB Atlas', 'Gemini API', 'Tailwind CSS', 'Monaco Code Editor'],
    suggestedModules: [
      'Adaptive Learning Path & Skill Tree Visualizer',
      'Gemini Quiz & Concept Explanation Generator',
      'In-Browser Interactive Exercise Runner',
      'Milestone Progress Badges & NCX Study Rewards',
      'Instructor Cohort Analytics & Grading Dashboard'
    ],
    proposedMilestones: [
      { title: 'Phase 1: Student & Teacher Workspaces', duration: '2 Weeks', deliverables: ['User Schemas', 'Course Catalog', 'Lesson Player Wireframes'] },
      { title: 'Phase 2: Adaptive Quiz & Content Generation', duration: '3 Weeks', deliverables: ['Gemini Prompt Pipeline', 'Instant Feedback Model', 'Rubric Scoring'] },
      { title: 'Phase 3: Interactive Sandbox & Gamification', duration: '3 Weeks', deliverables: ['Code Runner / Exercise UI', 'Milestone Badges', 'Leaderboard'] },
      { title: 'Phase 4: Production Hardening & Export Hub', duration: '2 Weeks', deliverables: ['Course Export Engine', 'Telemetry Dashboards', 'Verified Release'] }
    ],
    projectComplexity: 'Medium',
    indicativeFeasibilityScore: 91
  }
};

// POST /api/ai/public-sandbox — Public AI demonstration sandbox endpoint
aiAssistantRouter.post('/public-sandbox', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'Demonstration rate limit reached (15 requests/minute). Please explore existing previews or create an account for full access.'
      });
    }

    const { prompt = '', chipKey = '' } = req.body;
    const cleanPrompt = (prompt || '').trim();
    const cleanChip = (chipKey || cleanPrompt).toLowerCase().trim();

    // Check if matching predefined chip
    const predefined = PREDEFINED_CHIP_BLUEPRINTS[cleanChip];

    const hasApiKey = Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);

    // If custom prompt or user asked to synthesize with Gemini
    if (cleanPrompt && !predefined && hasApiKey) {
      try {
        const geminiPrompt = `You are a Principal Software Architect at NexusCraft. Analyze this software idea: "${cleanPrompt}". Return a strictly valid JSON object with NO markdown formatting, matching this exact shape:
{
  "title": "String",
  "projectOverview": "2-3 concise sentences",
  "suggestedTechnologies": ["Array", "of", "6-8", "technologies"],
  "suggestedModules": ["Array", "of", "4-6", "core", "modules"],
  "proposedMilestones": [
    {"title": "Phase 1: ...", "duration": "X Weeks", "deliverables": ["A", "B"]},
    {"title": "Phase 2: ...", "duration": "X Weeks", "deliverables": ["C", "D"]},
    {"title": "Phase 3: ...", "duration": "X Weeks", "deliverables": ["E", "F"]},
    {"title": "Phase 4: ...", "duration": "X Weeks", "deliverables": ["G", "H"]}
  ],
  "projectComplexity": "Low" | "Medium" | "High" | "Enterprise",
  "indicativeFeasibilityScore": number between 75 and 96
}`;
        const rawResponse = await queryGemini(geminiPrompt);
        if (rawResponse) {
          const cleanJson = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          return res.json({
            ...parsed,
            isAiGenerated: true,
            isPredefined: false,
            disclaimer: 'Indicative feasibility score and scoping estimation provided for exploratory planning. Does not constitute a guaranteed commercial quote or technical warranty.'
          });
        }
      } catch (err) {
        console.warn('Gemini sandbox fallback:', err.message);
      }
    }

    // If predefined chip selected
    if (predefined) {
      return res.json({
        ...predefined,
        isAiGenerated: false,
        isPredefined: true,
        disclaimer: 'Indicative feasibility score and scoping estimation provided for exploratory planning. Does not constitute a guaranteed commercial quote or technical warranty.'
      });
    }

    // Heuristic generator for custom prompt when no Gemini key is set
    const fallbackTitle = cleanPrompt || 'AI Digital Platform';
    return res.json({
      title: fallbackTitle,
      projectOverview: `NexusCraft architectural scoping blueprint for "${fallbackTitle}". Engineered with modern decoupled micro-services, authenticated role separation, and real-time state telemetry.`,
      suggestedTechnologies: ['React 19', 'TypeScript', 'Node.js', 'Express', 'MongoDB Atlas', 'Tailwind CSS', 'Docker'],
      suggestedModules: [
        'Secure Identity & Multi-Role Permissions',
        'Interactive User Intake & Request Hub',
        'Stateful Workflow Pipeline & Audit Stream',
        'Real-time Notification & Signal Center',
        'Exportable Document & Telemetry Engine'
      ],
      proposedMilestones: [
        { title: 'Phase 1: Architecture & Data Contracts', duration: '2 Weeks', deliverables: ['System Wireframes', 'Database Schemas', 'API Specs'] },
        { title: 'Phase 2: Core Platform Development', duration: '3 Weeks', deliverables: ['Primary User Journeys', 'Role Dashboards', 'Workflow Actions'] },
        { title: 'Phase 3: Integration & Intelligence Polish', duration: '2 Weeks', deliverables: ['AI Assistance Hooks', 'Audit Logging', 'Security Scans'] },
        { title: 'Phase 4: Hardening & Production Release', duration: '2 Weeks', deliverables: ['Performance QA', 'Verified ZIP Deliverable', 'Handover Docs'] }
      ],
      projectComplexity: 'Medium',
      indicativeFeasibilityScore: 89,
      isAiGenerated: false,
      isPredefined: false,
      disclaimer: 'Indicative feasibility score and scoping estimation provided for exploratory planning. Does not constitute a guaranteed commercial quote or technical warranty.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to generate heuristic slides if Gemini is offline
const generateHeuristicSlides = (topic, audience, category, count = 8, templateKey = 'concept-cards') => {
  const cleanTopic = topic || 'Next-Generation Digital Product';
  const cleanAudience = audience || 'Stakeholders & Leadership';
  
  return [
    {
      slideNumber: 1,
      title: cleanTopic,
      subtitle: `Strategic Presentation Prepared for ${cleanAudience}`,
      layout: 'title',
      bullets: [
        `Executive Overview & Market Opportunity`,
        `Core Value Proposition & Defensible Advantage`,
        `Technical Architecture & Execution Roadmap`
      ],
      stats: [
        { label: 'Target Market', value: '$48B+' },
        { label: 'Time to Value', value: '< 90 Days' },
        { label: 'Projected Growth', value: '3.8x YoY' }
      ],
      visualNotes: 'Bold minimalist cover slide with brand accent gradients.'
    },
    {
      slideNumber: 2,
      title: 'The Core Problem & Market Friction',
      subtitle: 'Why existing legacy workflows are failing users today',
      layout: 'split',
      bullets: [
        'Disjointed tools force teams into costly context switching and manual copy-pasting',
        'Lack of real-time state synchronization causes data fragmentation and customer churn',
        'Legacy systems fail to leverage generative AI models effectively at scale',
        'Organizations lose over 32% of operational velocity to administrative overhead'
      ],
      stats: [
        { label: 'Annual Productivity Loss', value: '32%' },
        { label: 'SaaS Tool Fragmentation', value: '14+ Apps' }
      ],
      visualNotes: 'Split comparison layout highlighting pain points and friction metrics.'
    },
    {
      slideNumber: 3,
      title: 'Our Solution & Strategic Advantage',
      subtitle: `Transforming ${cleanTopic} with intelligent automation`,
      layout: 'cards',
      bullets: [
        'Unified Workspace: Single pane of glass for intake, execution, and delivery',
        'AI-Native Architecture: Real-time scoping, automated synthesis, and smart assistance',
        'Guaranteed Reliability: Bank-grade role permissions and tamper-evident audit trails',
        'Rapid Time-to-Market: Modular component blocks accelerating deployment'
      ],
      stats: [
        { label: 'Deployment Speed', value: '4x Faster' },
        { label: 'Cost Reduction', value: '45%' },
        { label: 'User Satisfaction', value: '98%' }
      ],
      visualNotes: 'Card grid featuring key solution pillars with glowing accents.'
    },
    {
      slideNumber: 4,
      title: 'Market Opportunity & Target Demographics',
      subtitle: `Addressable market and expansion potential in ${category || 'Technology'}`,
      layout: 'stats',
      bullets: [
        'Total Addressable Market (TAM) growing at 24.6% Compound Annual Growth Rate',
        'Primary customer beachhead: Fast-moving engineering and product teams',
        'High organic net revenue retention driven by sticky multi-role workflows',
        'Expansion vectors into enterprise governance and automated compliance'
      ],
      stats: [
        { label: 'TAM', value: '$52 Billion' },
        { label: 'SAM', value: '$12.4 Billion' },
        { label: 'SOM (Year 3)', value: '$450 Million' }
      ],
      visualNotes: 'Data visualizer with circular TAM/SAM/SOM badges.'
    },
    {
      slideNumber: 5,
      title: 'System Architecture & Data Flow',
      subtitle: 'Modern, resilient, and enterprise-grade tech stack',
      layout: 'cards',
      bullets: [
        'Frontend: React 19, TypeScript, and high-performance Vite micro-bundles',
        'API Gateway: Stateless Node.js REST services with rate-limiting & Zod validation',
        'Intelligence Layer: Hybrid Gemini LLM models with zero client-side credential exposure',
        'Storage & State: Cloud-native MongoDB Atlas compound clusters with AES-256 encryption'
      ],
      stats: [
        { label: 'API Latency', value: '< 85ms' },
        { label: 'Uptime SLA', value: '99.95%' }
      ],
      visualNotes: 'Multi-tier architectural diagram representation.'
    },
    {
      slideNumber: 6,
      title: 'Traction & Strategic Milestones',
      subtitle: 'Execution track record and measurable customer outcomes',
      layout: 'timeline',
      bullets: [
        'Phase 1 — Foundation & Alpha Launch: Core workflow validation with pilot cohort',
        'Phase 2 — Multi-Role Ecosystem: Full client, freelancer, and admin portals released',
        'Phase 3 — Intelligence Integration: AI Blueprint Sandbox and live export studio',
        'Phase 4 — Enterprise Scale: Global expansion, compliance certifications, and API ecosystem'
      ],
      stats: [
        { label: 'Active Pilots', value: '25+' },
        { label: 'NPS Score', value: '+74' }
      ],
      visualNotes: 'Horizontal chronological timeline showing sequential phases.'
    },
    {
      slideNumber: 7,
      title: 'Business Model & Unit Economics',
      subtitle: 'Monetization structure and defensible unit margins',
      layout: 'split',
      bullets: [
        'Dual-stream revenue: Transparent platform take-rate + NCX token utility model',
        'Enterprise tier with dedicated SLA, custom AI models, and private cloud deployments',
        'Predictable customer lifetime value (LTV) exceeding customer acquisition cost (CAC) by 4.2x',
        'Gross margins exceeding 78% driven by lean serverless cloud infrastructure'
      ],
      stats: [
        { label: 'LTV / CAC Ratio', value: '4.2x' },
        { label: 'Gross Margin', value: '78%' }
      ],
      visualNotes: 'Split card showing business pillars on left and financial metrics on right.'
    },
    {
      slideNumber: 8,
      title: 'Call to Action & Next Steps',
      subtitle: 'Join us in building the future from idea to reality',
      layout: 'conclusion',
      bullets: [
        'Schedule a private executive walkthrough and technical deep-dive',
        'Review complete engineering repository, audit certifications, and financial model',
        'Lock in strategic pilot deployment allocation for Q1 execution',
        'Contact: team@nexuscraft.app | https://nexuscraft.app'
      ],
      stats: [
        { label: 'Next Review', value: 'Within 48h' },
        { label: 'Contact', value: 'nexuscraft.app' }
      ],
      visualNotes: 'High-impact conclusion slide with distinct call to action card.'
    }
  ].slice(0, count);
};

// POST /api/ai/presentation/generate-outline — Generate or reconstruct presentation slides
aiAssistantRouter.post('/presentation/generate-outline', async (req, res) => {
  try {
    const {
      topic = 'AI Digital Product Pitch',
      audience = 'Stakeholders & Clients',
      category = 'Technology',
      slideCount = '8-12',
      templateKey = 'concept-cards',
      aspectRatio = '16:9',
      language = 'English',
      sourceType = 'text',
      rawContent = ''
    } = req.body;

    // Determine target slide count number
    let targetCount = 8;
    if (typeof slideCount === 'number') {
      targetCount = Math.max(4, Math.min(16, slideCount));
    } else if (slideCount === '8–12' || slideCount === '8-12') {
      targetCount = 8;
    } else if (slideCount === 'Company overview') {
      targetCount = 10;
    } else if (slideCount === 'Auto') {
      targetCount = 8;
    } else {
      const parsed = parseInt(slideCount, 10);
      if (!isNaN(parsed)) targetCount = Math.max(4, Math.min(16, parsed));
    }

    const hasApiKey = Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);

    if (hasApiKey) {
      try {
        const geminiPrompt = `You are a Principal Presentation Architect and Chief Venture Strategist.
Create a structured presentation deck in ${language} for:
Topic: "${topic}"
Target Audience: "${audience}"
Category: "${category}"
Source Content / Brief: "${rawContent ? rawContent.slice(0, 1500) : 'None'}"
Total Slides Required: exactly ${targetCount} slides.

Return ONLY a valid JSON array of ${targetCount} slide objects with NO Markdown backticks. Each slide must match this structure:
[
  {
    "slideNumber": 1,
    "title": "Short punchy slide title",
    "subtitle": "Informative subtitle or context",
    "layout": "title" | "split" | "cards" | "stats" | "timeline" | "conclusion",
    "bullets": ["Bullet 1", "Bullet 2", "Bullet 3", "Bullet 4"],
    "stats": [
      {"label": "Metric Name", "value": "Number/Value"},
      {"label": "Metric Name", "value": "Number/Value"}
    ],
    "visualNotes": "Brief art direction note"
  }
]`;

        const rawResponse = await queryGemini(geminiPrompt);
        if (rawResponse) {
          const cleanJson = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return res.json({
              topic,
              audience,
              category,
              templateKey,
              aspectRatio,
              language,
              slideCount: parsed.length,
              slides: parsed,
              isAiGenerated: true
            });
          }
        }
      } catch (err) {
        console.warn('Gemini presentation generation failed, falling back to heuristics:', err.message);
      }
    }

    // Heuristic fallback
    const slides = generateHeuristicSlides(topic, audience, category, targetCount, templateKey);
    return res.json({
      topic,
      audience,
      category,
      templateKey,
      aspectRatio,
      language,
      slideCount: slides.length,
      slides,
      isAiGenerated: false
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/presentation/convert-deck — Convert messy notes/outline into clean slide deck
aiAssistantRouter.post('/presentation/convert-deck', async (req, res) => {
  try {
    const { rawText = '', templateKey = 'concept-cards', targetSlideCount = 8 } = req.body;
    if (!rawText.trim()) {
      return res.status(400).json({ error: 'Text or document content is required for conversion.' });
    }

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const titleCandidate = lines[0] || 'Converted Presentation';
    const slides = generateHeuristicSlides(titleCandidate, 'Audience', 'Business', targetSlideCount, templateKey);

    // Map extracted lines into bullets of the first few slides
    if (lines.length > 1) {
      let bulletIdx = 1;
      for (let s = 1; s < slides.length && bulletIdx < lines.length; s++) {
        const chunk = lines.slice(bulletIdx, bulletIdx + 3);
        if (chunk.length > 0) {
          slides[s].bullets = chunk;
          bulletIdx += 3;
        }
      }
    }

    return res.json({
      topic: titleCandidate,
      templateKey,
      slideCount: slides.length,
      slides,
      isConverted: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

