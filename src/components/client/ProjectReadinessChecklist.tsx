import React from 'react';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';
import type { ProjectRequest } from '../../types';

interface ProjectReadinessChecklistProps {
  project: ProjectRequest | null;
}

export const ProjectReadinessChecklist: React.FC<ProjectReadinessChecklistProps> = ({ project }) => {
  if (!project) return null;

  const checks = [
    {
      id: 'objective',
      label: 'Clear Project Objective Defined',
      description: 'A succinct description of what the platform accomplishes.',
      passed: Boolean(project.projectTitle && (project.rawIdea || project.aiSummary)?.length >= 20)
    },
    {
      id: 'features',
      label: 'Core Functional Requirements Specified (≥3 Features)',
      description: 'At least 3 discrete software modules or functional capabilities.',
      passed: Boolean(project.aiSuggestedFeatures && project.aiSuggestedFeatures.length >= 3)
    },
    {
      id: 'assumptions',
      label: 'Architecture Questions & Scoping Assumptions Addressed',
      description: 'Clarifications on authentication, hosting, database, and integrations.',
      passed: Boolean(project.aiAssumptions && project.aiAssumptions.length >= 2)
    },
    {
      id: 'category',
      label: 'Software Domain & Category Classified',
      description: 'E-commerce, SaaS, Web App, Healthcare, or Custom Workflow.',
      passed: Boolean(project.aiCategory && project.aiCategory !== 'Uncategorized')
    },
    {
      id: 'attachments',
      label: 'Reference Material or Architectural Document Attached',
      description: 'Specification documents, wireframes, or reference benchmark URLs.',
      passed: Boolean(project.docFileName || project.referenceUrl)
    }
  ];

  const passedCount = checks.filter(c => c.passed).length;
  const readinessScore = Math.round((passedCount / checks.length) * 100);

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm space-y-5">
      {/* Header with Readiness Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F2F8]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#7357FF] bg-[#E9E3FF] px-2 py-0.5 rounded">
              PROJECT QUALITY GATE
            </span>
            <span className="text-xs text-[#777B8A]">Pre-Flight Specification Score</span>
          </div>
          <h3 className="font-display font-bold text-base text-[#222438]">
            Project Readiness Checklist
          </h3>
          <p className="text-xs text-[#777B8A]">
            Complete criteria to accelerate specialist quotation accuracy and eliminate scope ambiguity.
          </p>
        </div>

        {/* Readiness Meter */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-display font-extrabold text-[#222438]">
              {readinessScore}%
            </div>
            <span className="text-[10px] font-bold text-[#777B8A] uppercase">
              {readinessScore >= 80 ? 'Ready for Build' : readinessScore >= 60 ? 'Good Draft' : 'Needs Scoping'}
            </span>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-[#F8F9FD] border border-[#E9EAF0] flex items-center justify-center p-2">
            <div className="relative w-full h-full flex items-center justify-center font-bold text-xs text-[#7357FF]">
              <Sparkles className="w-5 h-5 text-[#7357FF]" />
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checks.map(item => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
              item.passed
                ? 'bg-[#F9FCFA] border-[#24A675]/20'
                : 'bg-[#FDFBF9] border-amber-200/60'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {item.passed ? (
                <CheckCircle2 className="w-4 h-4 text-[#24A675]" />
              ) : (
                <Circle className="w-4 h-4 text-[#A0A4B8]" />
              )}
            </div>

            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${item.passed ? 'text-[#222438]' : 'text-[#777B8A]'}`}>
                  {item.label}
                </span>
                <span className={`text-[10px] font-mono font-bold uppercase ${
                  item.passed ? 'text-[#24A675]' : 'text-amber-600'
                }`}>
                  {item.passed ? 'PASSED' : 'RECOMMENDED'}
                </span>
              </div>
              <p className="text-[11px] text-[#777B8A] leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
