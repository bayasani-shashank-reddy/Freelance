import React, { useState } from 'react';
import { X, FileText, Copy, Check, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import type { ProjectRequest } from '../../types';
import confetti from 'canvas-confetti';

interface TechnicalHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRequest | null;
  freelancerName?: string;
  onSaved: () => void;
}

export const TechnicalHandoverModal: React.FC<TechnicalHandoverModalProps> = ({
  isOpen,
  onClose,
  project,
  freelancerName = 'Specialist',
  onSaved
}) => {
  if (!isOpen || !project) return null;

  const [overview, setOverview] = useState(
    `Production release deliverable package for "${project.projectTitle}". Built in accordance with approved architectural specifications.`
  );
  const [technologies, setTechnologies] = useState('React, TypeScript, Node.js, Express, MongoDB, Tailwind CSS');
  const [installationInstructions, setInstallationInstructions] = useState(
    '1. Extract ZIP deliverable archive to target directory.\n2. Run `npm install` in root directory.\n3. Run `npm install` in /server directory.'
  );
  const [envVariables, setEnvVariables] = useState('PORT=5000\nMONGODB_URI=your_mongodb_connection_string\nJWT_SECRET=your_jwt_secret');
  const [databaseSetup, setDatabaseSetup] = useState(
    '1. Connect to MongoDB Atlas or local instance.\n2. Run `node server/seedAccounts.js` to initialize default collections if needed.'
  );
  const [startupInstructions, setStartupInstructions] = useState(
    'Development server:\n- Frontend: `npm run dev` (Port 5173)\n- Backend: `node server/index.js` (Port 5000)\n\nProduction build:\n- `npm run build`\n- `npm run preview` or serve /dist statically.'
  );
  const [keyModules] = useState('Authentication & Role Guardrails, Real-time REST API, Document Parser, NCX Ledger');
  const [knownLimitations, setKnownLimitations] = useState('Third-party SMS webhook requires active provider credentials in production environment.');
  const [futureRecommendations, setFutureRecommendations] = useState('Implement Redis cache for high-throughput session workloads and automated daily backup cron.');

  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const generateMarkdown = () => {
    return `# Technical Handover & Runbook: ${project.projectTitle}
**Author:** ${freelancerName}  
**Date:** ${new Date().toLocaleDateString()}  
**Client:** ${project.clientName}  

---

## 1. Project Overview
${overview}

## 2. Technology Stack
${technologies}

## 3. Installation & Prerequisites
${installationInstructions}

## 4. Environment Variables Required
\`\`\`env
${envVariables}
\`\`\`

## 5. Database Configuration
${databaseSetup}

## 6. Startup Commands
\`\`\`bash
${startupInstructions}
\`\`\`

## 7. Key Architecture Modules
${keyModules}

## 8. Known Limitations & Edge Cases
${knownLimitations}

## 9. Future Architecture Recommendations
${futureRecommendations}

---
*Generated via NexusCraft Managed Delivery Studio*
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveHandover = async () => {
    setIsSaving(true);
    const res = await api.saveHandoverDoc(project.customId || project.id, {
      overview,
      technologies: technologies.split(',').map(t => t.trim()),
      installationInstructions,
      envVariables: envVariables.split('\n').map(e => e.trim()),
      databaseSetup,
      startupInstructions,
      keyModules: keyModules.split(',').map(m => m.trim()),
      knownLimitations,
      futureRecommendations,
      authorName: freelancerName
    });
    setIsSaving(false);

    if (res.success) {
      confetti({ particleCount: 40, spread: 40 });
      onSaved();
      onClose();
    } else {
      alert(res.error || 'Failed to save handover runbook.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E9EAF0] space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0F2F8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9E3FF] text-[#7357FF] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl text-[#222438]">
                Technical Handover Generator
              </h3>
              <p className="text-xs text-[#777B8A]">
                Generate structured deployment & engineering runbook for <strong className="text-[#222438]">{project.projectTitle}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#777B8A] hover:bg-[#F5F6FA] hover:text-[#222438] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#222438] mb-1">Project Overview</label>
            <textarea
              rows={2}
              value={overview}
              onChange={e => setOverview(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#7357FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#222438] mb-1">Technologies & Frameworks</label>
            <input
              type="text"
              value={technologies}
              onChange={e => setTechnologies(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#7357FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#222438] mb-1">Installation Instructions</label>
              <textarea
                rows={3}
                value={installationInstructions}
                onChange={e => setInstallationInstructions(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#7357FF] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#222438] mb-1">Environment Variables Template</label>
              <textarea
                rows={3}
                value={envVariables}
                onChange={e => setEnvVariables(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#7357FF] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#222438] mb-1">Database Setup</label>
              <textarea
                rows={2}
                value={databaseSetup}
                onChange={e => setDatabaseSetup(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#7357FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#222438] mb-1">Application Startup Commands</label>
              <textarea
                rows={2}
                value={startupInstructions}
                onChange={e => setStartupInstructions(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#7357FF] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#222438] mb-1">Known Limitations</label>
              <input
                type="text"
                value={knownLimitations}
                onChange={e => setKnownLimitations(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#7357FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#222438] mb-1">Future Recommendations</label>
              <input
                type="text"
                value={futureRecommendations}
                onChange={e => setFutureRecommendations(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E9EAF0] text-xs text-[#222438] outline-none focus:border-[#7357FF]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#F0F2F8]">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-[#E9EAF0] text-[#222438] hover:bg-[#F5F6FA] flex items-center gap-1.5 transition-all"
          >
            {isCopied ? <Check className="w-4 h-4 text-[#24A675]" /> : <Copy className="w-4 h-4 text-[#7357FF]" />}
            <span>{isCopied ? 'Copied Markdown!' : 'Copy as Markdown'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#777B8A] hover:bg-[#F5F6FA] rounded-xl"
            >
              Close
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveHandover}
              className="px-5 py-2.5 text-xs font-bold bg-[#7357FF] hover:bg-[#5E42E6] text-white rounded-xl shadow-md shadow-[#7357FF]/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Attaching...' : 'Attach Runbook to Deliverable'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
