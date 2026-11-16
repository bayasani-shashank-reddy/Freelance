import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Copy, Check, Search, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';
import FinalCtaFooter from '../../components/sections/FinalCtaFooter';
import { BoxedButton } from '../../components/shared/BoxedButton';

export const BlueprintSamplePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState(1);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const blueprintSections = [
    {
      num: 1,
      title: 'Executive Overview & Problem Statement',
      category: 'Strategic Scope',
      content: `OmniHealth is an enterprise-grade AI-assisted patient triage, appointment routing, and secure telemedicine platform designed for healthcare networks with 50+ clinics.

Problem Statement:
Emergency rooms and outpatient clinics suffer from high administrative overhead, 45-minute average triage delays, and frequent non-urgent visits that overwhelm specialized physicians.

Solution Architecture:
A HIPAA-compliant web and mobile interface enabling patients to self-report symptoms through guided multimodal inputs. An integrated Google Gemini Medical Engine provides preliminary acuity triage (ESI Levels 1–5), auto-generates structured clinical intake summaries for EHR ingestion, and pairs urgent cases with on-call specialists in encrypted WebRTC video rooms.`
    },
    {
      num: 2,
      title: 'Target Audience & User Personas',
      category: 'Strategic Scope',
      content: `1. Patient (Emma, 34): Needs immediate symptom assessment for pediatric fever at 10 PM. Values instant triage, automated wait-time estimators, and one-tap video consultations.
2. Triage Nurse (Marcus, 42): Reviews incoming patient queues, verifies AI-flagged red-flag symptoms (chest pain, stroke indicators), and directs patients to ICU or telemedicine.
3. Attending Physician (Dr. Chen, 48): Reviews the pre-compiled 1-page clinical summary, reviews medication history, and writes e-prescriptions during virtual consultations.
4. Clinic Administrator (Sarah, 50): Monitors clinic throughput, physician utilization metrics, and insurance pre-authorization claim approval rates.`
    },
    {
      num: 3,
      title: 'Core Functional Requirements & User Stories',
      category: 'Functional Spec',
      content: `FR-1: Multimodal Patient Symptom Intake — Patients can submit voice notes, textual complaints, and photo uploads of visible symptoms with client-side image redaction.
FR-2: AI Clinical Scoping Engine — Classifies complaints into Emergency Severity Index (ESI 1 to 5) with confidence scores and justification notes.
FR-3: Encrypted WebRTC Video Rooms — Low-latency, peer-to-peer virtual consultation rooms with screen sharing and in-session clinical note dictation.
FR-4: Electronic Health Record (EHR) Sync — HL7/FHIR compliant data exchange pipeline pushing structured intake dossiers directly to Epic and Cerner systems.
FR-5: Automated E-Prescription Gateway — Integrated with Surescripts API for tamper-proof pharmacy dispatch.`
    },
    {
      num: 4,
      title: 'System Architecture & Data Flow Diagram',
      category: 'Technical Architecture',
      content: `Architecture Overview:
The platform is deployed as a microservices architecture using an API Gateway pattern with event-driven asynchronous processing.

Frontend Client (React 19 / Vite / Tailwind)
   ↓ (TLS 1.3 / HTTPS)
API Gateway & Reverse Proxy (NGINX / Envoy)
   ↓
Core Application Server (Node.js Express / TypeScript)
   ├── Auth Service (OAuth2 / JWT / TOTP MFA)
   ├── Triage Engine (Gemini 2.5 API with medical prompt guards)
   ├── Telehealth Signaling Service (WebRTC / Socket.IO)
   └── EHR Integration Service (FHIR / HL7 Bridge)
   ↓
Data Persistence Layer:
   ├── PostgreSQL (Encrypted Relational Clinical Records & Audit Logs)
   ├── MongoDB Atlas (Unstructured Clinical Intake Dossiers & JSON Blueprints)
   ├── Redis Cluster (Session Caching, Rate Limiting & WebRTC Presence)
   └── AWS S3 / Cloudflare R2 (AES-256 Encrypted Diagnostic Images & Recordings)`
    },
    {
      num: 5,
      title: 'Technology Stack & Selection Justification',
      category: 'Technical Architecture',
      content: `• Frontend: React 19, TypeScript, Tailwind CSS, Lucide Icons. Chosen for sub-second hydration, strict type safety, and accessibility.
• Backend: Node.js (v20+ LTS), Express.js, TypeScript. High throughput I/O for concurrent telehealth signaling and API bridging.
• Database: PostgreSQL 16 (for structured patient IDs, billing, and relational audit logs) + MongoDB Atlas (for dynamic medical blueprints and questionnaires).
• Cache & Message Queue: Redis 7.2 + BullMQ for asynchronous triage scoring and HL7 message dispatch.
• Real-time Telehealth: WebRTC with Janus Media Server SFU for multi-party clinical conferences.
• AI Engine: Google Gemini 2.5 Flash with zero-retention HIPAA BAA compliance.`
    },
    {
      num: 6,
      title: 'Database Entity Relationship Schema',
      category: 'Data Engineering',
      content: `Entities & Relationships:
• Users: id (UUID PK), email, password_hash, role (patient, nurse, doctor, admin), mfa_secret, created_at.
• Patients: id, user_id (FK), date_of_birth, blood_type, emergency_contact, insurance_provider, policy_num.
• Consultations: id, patient_id (FK), doctor_id (FK), status (pending, in_progress, completed, cancelled), scheduled_time, room_token.
• TriageDossiers: id, consultation_id (FK), esi_score (1-5), primary_complaint, ai_summary, vital_signs (JSONB), red_flags (ARRAY), created_at.
• AuditLogs: id, actor_id (FK), action, resource, ip_address, user_agent, timestamp, sha256_hash.

Constraints: All clinical tables enforce row-level encryption and immutable timestamping.`
    },
    {
      num: 7,
      title: 'RESTful API Specification',
      category: 'Data Engineering',
      content: `POST /api/v1/triage/intake
Request:
{
  "patientId": "pt-8921-uuid",
  "complaint": "Persistent high fever (103°F) for 48 hours with severe neck stiffness and photophobia.",
  "symptomOnsetHours": 48,
  "vitals": { "tempF": 103.2, "heartRateBpm": 118, "spo2Percent": 98 }
}

Response (200 OK):
{
  "dossierId": "dos-109283",
  "acuityLevel": "ESI-2",
  "urgencyCategory": "Emergent — Immediate Medical Attention Advised",
  "confidenceScore": 0.94,
  "redFlagIndicators": ["Meningismus suspicion", "High pyrexia with tachycardia"],
  "recommendedAction": "Direct Transfer to Emergency Department / Expedited Physician Consultation"
}`
    },
    {
      num: 8,
      title: 'Authentication, Authorization & Role-Based Access Control',
      category: 'Security & Compliance',
      content: `• Authentication: Dual-token system with short-lived JWT access tokens (15 minutes) and encrypted HTTP-only refresh tokens (7 days).
• Multi-Factor Authentication: Mandatory TOTP (RFC 6238) for all clinical and administrative staff.
• RBAC Enforcement: Strict server-side route middleware verifying roles:
  - 'patient': Can only query own consultations, dossiers, and profile.
  - 'nurse': Can read/write patient triage queues and vital sign logs.
  - 'doctor': Full read/write access to clinical encounters and e-prescriptions.
  - 'admin': Platform analytics, user provisioning, and immutable audit inspection.`
    },
    {
      num: 9,
      title: 'Third-Party Integrations & External APIs',
      category: 'Integrations',
      content: `1. Google Gemini Medical API: Symptom extraction, natural language translation, and clinical dossier formatting under HIPAA BAA.
2. Twilio Video / Janus Gateway: Fallback TURN/STUN infrastructure ensuring 99.9% WebRTC connection success across hospital firewalls.
3. Surescripts API: Certified e-prescription dispatch to 65,000+ national pharmacies.
4. Stripe Healthcare Connect: Patient co-pay processing, insurance deductible capture, and HSA/FSA debit card processing.`
    },
    {
      num: 10,
      title: 'Security, HIPAA Compliance & Encryption Standards',
      category: 'Security & Compliance',
      content: `• Data-at-Rest Encryption: AES-256 encryption on all database volumes, document stores, and backup archives.
• Data-in-Transit Encryption: TLS 1.3 enforced on all external and inter-service communications with HSTS preloading.
• HIPAA Compliance Guarantees:
  - Zero PHI logging in standard application telemetry.
  - Automatic session logout after 10 minutes of inactivity.
  - Comprehensive Business Associate Agreements (BAAs) with all cloud vendors.
  - Field-level encryption for Social Security Numbers and patient identifiable identifiers.`
    },
    {
      num: 11,
      title: 'Performance Benchmarks & Scalability Targets',
      category: 'Infrastructure',
      content: `• Concurrent Users: Designed to support 15,000 concurrent active consultations with sub-second API latencies.
• Triage Latency: Sub-1200ms turnaround for AI intake scoring and ESI categorization.
• WebRTC Video Latency: < 150ms round-trip audio/video latency across North American nodes.
• Horizontal Auto-scaling: Kubernetes HPA scaling API pods when CPU exceeds 65% or memory exceeds 75%.`
    },
    {
      num: 12,
      title: 'Deployment Topology & CI/CD Pipeline',
      category: 'Infrastructure',
      content: `• Cloud Provider: AWS Multi-AZ (us-east-1 and us-west-2) with Cloudflare Enterprise Edge.
• Orchestration: Amazon EKS (Kubernetes 1.30) with isolated VPC subnets for databases and clinical workloads.
• CI/CD Pipeline: GitHub Actions automated workflow:
  1. Linting & Formatting: ESLint, Prettier, TypeScript strict check.
  2. Automated Unit Tests: Vitest suite (85%+ coverage requirement).
  3. Static Security Analysis: Snyk vulnerability scan and GitGuardian secret detection.
  4. Build & Containerization: Multi-stage Docker builds signed with Cosign.
  5. Deployment: ArgoCD GitOps sync to staging and canary production.`
    },
    {
      num: 13,
      title: 'Milestone Delivery Schedule & Phased Sprints',
      category: 'Delivery Plan',
      content: `Phase 1 (Weeks 1–3): Core HIPAA Infrastructure, Auth & Database ERD Setup ($8,500 / 850 NCX).
Phase 2 (Weeks 4–6): AI Multimodal Intake & ESI Triage Scoring Engine ($12,000 / 1,200 NCX).
Phase 3 (Weeks 7–9): Encrypted WebRTC Video Consultation Room & Notes ($11,500 / 1,150 NCX).
Phase 4 (Weeks 10–12): EHR FHIR Integration, E-Prescriptions & Stripe Payments ($10,000 / 1,000 NCX).
Phase 5 (Weeks 13–14): End-to-End Penetration Testing, HIPAA Audit & Verified Handover ($6,000 / 600 NCX).`
    },
    {
      num: 14,
      title: 'Risk Analysis & Mitigation Matrix',
      category: 'Delivery Plan',
      content: `• Risk 1: AI Hallucination in Symptom Analysis.
  Mitigation: Strict rule-based guardrails; AI output is explicitly labeled as preliminary guidance; high-risk red-flag keywords trigger mandatory human clinician review.
• Risk 2: WebRTC Connection Failures across Strict Hospital Firewalls.
  Mitigation: Dedicated coturn TURN servers operating over TCP port 443 with TLS fallback.
• Risk 3: EHR Integration Delays due to Vendor Certification.
  Mitigation: Modular FHIR adapter abstraction layer allowing mock sandbox testing while official certification progresses.`
    },
    {
      num: 15,
      title: 'Comprehensive Quality Assurance & Testing Strategy',
      category: 'Verification',
      content: `• Unit Testing: Vitest test suites covering business logic, triage score calculation, and token deduction.
• Integration Testing: Supertest covering all REST API endpoints, JWT token renewal, and database queries.
• E2E Testing: Playwright headless browser test simulating patient intake $\rightarrow$ AI triage $\rightarrow$ nurse review $\rightarrow$ video consultation.
• Security Audits: OWASP ZAP automated vulnerability scans and automated dependency checks.`
    },
    {
      num: 16,
      title: 'Acceptance Criteria & Definition of Done',
      category: 'Verification',
      content: `1. All 17 architectural requirements implemented with 100% feature coverage.
2. 0 Critical or High severity security vulnerabilities detected in automated audits.
3. Successful completion of 50 simultaneous mock WebRTC video calls without frame drops.
4. Clean export of FHIR-compliant JSON patient intake bundles.
5. All source code packaged into a clean ZIP archive with SHA-256 cryptographic verification.`
    },
    {
      num: 17,
      title: 'Post-Launch Maintenance & Operational Runbook',
      category: 'Verification',
      content: `• Monitoring & Observability: Datadog APM dashboard tracking API latency, error rates, and CPU/memory utilization.
• Disaster Recovery: Automated daily PostgreSQL snapshots with 15-minute point-in-time recovery (PITR).
• Incident Response SLA: P1 (System Down): < 15 minutes response time; P2 (Degraded Performance): < 1 hour response time.
• Runbook Procedures: Clear operational playbooks for database failover, SSL certificate renewal, and API key rotation.`
    }
  ];

  const current = blueprintSections.find(s => s.num === activeSection) || blueprintSections[0];

  const handleCopyMarkdown = () => {
    const fullMarkdown = blueprintSections.map(s => `## Section ${s.num}: ${s.title}\n\n${s.content}\n`).join('\n---\n\n');
    navigator.clipboard.writeText(fullMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredSections = searchQuery.trim()
    ? blueprintSections.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : blueprintSections;

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#222438] font-sans antialiased">
      <Navbar />

      {/* Header */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9E3FF] text-[#7357FF] text-xs font-mono font-bold tracking-wider uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Interactive Public Blueprint Showcase</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#17172B] tracking-tight max-w-4xl mx-auto leading-tight">
          Explore an Actual <span className="bg-gradient-to-r from-[#7357FF] to-[#3978FF] bg-clip-text text-transparent">17-Section AI Blueprint</span>
        </h1>
        <p className="text-sm sm:text-base text-[#65677A] max-w-2xl mx-auto leading-relaxed">
          This is the exact level of architectural rigor generated when a client submits an idea to NexusCraft. No vague summaries. Complete production specifications.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E9EAF0] text-xs font-bold text-[#17172B] hover:bg-[#F5F6FA] shadow-sm transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Full Blueprint!' : 'Copy Full Markdown Blueprint'}</span>
          </button>
          <NavLink to="/submit-request">
            <BoxedButton variant="primary" size="md" className="flex items-center gap-2">
              <span>Generate Your Own Blueprint (50 NCX)</span>
              <ArrowRight className="w-4 h-4" />
            </BoxedButton>
          </NavLink>
        </div>
      </section>

      {/* Blueprint Explorer */}
      <section className="pb-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl border border-[#E9EAF0] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[750px]">
          
          {/* Left Navigation: Section Tabs */}
          <div className="lg:col-span-4 border-r border-[#E9EAF0] bg-[#F7F8FC] p-4 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7357FF]">
                  17 Sections Standard
                </span>
                <span className="text-xs font-mono font-bold text-[#777B8A]">
                  v2.4 Spec
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#777B8A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter 17 sections..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E9EAF0] bg-white text-xs text-[#17172B] focus:outline-none focus:border-[#7357FF]"
                />
              </div>

              {/* Scrollable Section List */}
              <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                {filteredSections.map(sec => {
                  const isActive = activeSection === sec.num;
                  return (
                    <button
                      key={sec.num}
                      onClick={() => setActiveSection(sec.num)}
                      className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all flex items-start gap-2.5 ${
                        isActive
                          ? 'bg-[#7357FF] text-white shadow-sm'
                          : 'text-[#65677A] hover:bg-white hover:text-[#17172B]'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center font-mono text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#65677A]'
                      }`}>
                        {sec.num}
                      </span>
                      <span className="line-clamp-1 leading-tight mt-0.5">
                        {sec.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Metadata Card */}
            <div className="p-4 rounded-2xl bg-white border border-[#E9EAF0] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#17172B]">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Sample: OmniHealth Telemedicine</span>
              </div>
              <p className="text-[11px] text-[#777B8A]">
                Synthesized by Google Gemini 2.5 Engine. Approved by Nexus Platform Architecture Lead.
              </p>
            </div>
          </div>

          {/* Right Main Content Viewport */}
          <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E9EAF0]">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7357FF]">
                    Section {current.num} of 17 · {current.category}
                  </span>
                  <h2 className="font-display font-extrabold text-2xl text-[#17172B] mt-1">
                    {current.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`## Section ${current.num}: ${current.title}\n\n${current.content}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="p-2 rounded-xl border border-[#E9EAF0] hover:bg-[#F5F6FA] text-xs font-semibold text-[#65677A] flex items-center gap-1.5"
                    title="Copy section markdown"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Section</span>
                  </button>
                </div>
              </div>

              {/* Section Body */}
              <div className="p-6 rounded-2xl bg-[#F7F8FC] border border-[#E9EAF0] font-mono text-xs text-[#222438] leading-relaxed whitespace-pre-wrap selection:bg-[#E9E3FF]">
                {current.content}
              </div>
            </div>

            {/* Bottom Section Navigator */}
            <div className="flex items-center justify-between pt-6 border-t border-[#E9EAF0]">
              <button
                disabled={activeSection <= 1}
                onClick={() => setActiveSection(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E9EAF0] hover:bg-[#F5F6FA] disabled:opacity-40 disabled:pointer-events-none text-[#17172B]"
              >
                ← Previous Section
              </button>

              <span className="text-xs font-mono font-bold text-[#777B8A]">
                {activeSection} / 17
              </span>

              <button
                disabled={activeSection >= 17}
                onClick={() => setActiveSection(prev => Math.min(17, prev + 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7357FF] text-white hover:bg-[#6042EE] disabled:opacity-40 disabled:pointer-events-none"
              >
                Next Section →
              </button>
            </div>
          </div>

        </div>
      </section>

      <FinalCtaFooter />
    </div>
  );
};

export default BlueprintSamplePage;
