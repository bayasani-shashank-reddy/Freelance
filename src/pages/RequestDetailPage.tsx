import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Link as LinkIcon,
  AlertCircle,
  Download,
  Check,
  Cpu,
  Clock,
  Eye
} from 'lucide-react';
import { api } from '../lib/api';
import type { ProjectRequest, RequestActivity } from '../types';
import { BoxedButton } from '../components/shared/BoxedButton';
import { DocumentViewerModal } from '../components/DocumentViewerModal';

export const RequestDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<ProjectRequest | null>(null);
  const [activities, setActivities] = useState<RequestActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docViewerOpen, setDocViewerOpen] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    const fetchDetails = async () => {
      setLoading(true);
      const res = await api.getProject(requestId);
      setLoading(false);
      if (res.success && res.request) {
        setRequest(res.request);
        setActivities(res.activities || []);
      } else {
        setError(res.error || 'Request not found.');
      }
    };
    fetchDetails();
  }, [requestId]);

  const stages = [
    { id: 'submitted', label: '01 Submitted', subtitle: 'Intake Registered' },
    { id: 'ai_scoped', label: '02 AI Scoped', subtitle: 'Architecture Drafted' },
    { id: 'admin_review', label: '03 Admin Review', subtitle: 'Triage & Feasibility' },
    { id: 'specialist', label: '04 Sourced', subtitle: 'Specialist Dispatched' },
    { id: 'validated', label: '05 Validated', subtitle: 'Commitment Ready' },
    { id: 'completed', label: '06 Completed', subtitle: 'Scope Finalized' }
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'Submitted':
      case 'New':
        return 0;
      case 'AI Scoped':
        return 1;
      case 'Under Admin Review':
        return 2;
      case 'Specialist Review':
        return 3;
      case 'In Progress':
        return 4;
      case 'Completed':
        return 5;
      default:
        return 2;
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <p className="text-xs font-mono text-[#65677A] animate-pulse">Loading project dossier...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <div className="p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
          <AlertCircle className="w-8 h-8 text-[#FF826E] mx-auto" />
          <h2 className="font-display font-bold text-xl text-[#17172B] dark:text-white">Request Not Located</h2>
          <p className="text-xs text-[#65677A]">{error || 'The requested project could not be found.'}</p>
          <BoxedButton variant="secondary" onClick={() => navigate('/client/dashboard')}>
            Back to Dashboard
          </BoxedButton>
        </div>
      </div>
    );
  }

  const currentIdx = getStageIndex(request.status);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
        <BoxedButton
          variant="secondary"
          size="sm"
          icon={<ArrowLeft className="w-3.5 h-3.5" />}
          onClick={() => navigate('/client/dashboard')}
        >
          Back to Dashboard
        </BoxedButton>

        <span className="text-xs font-mono font-bold text-[#7357FF] px-3 py-1 rounded-full bg-[#EEE9FF] dark:bg-[#252445]">
          RECORD #{request.customId || request.id}
        </span>
      </div>

      {/* Main Request Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#EEE9FF] text-[#7357FF]">
                {request.aiCategory || 'DIGITAL PRODUCT'}
              </span>
              <span className="text-xs text-[#65677A]">· Submitted {request.createdAt}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#17172B] dark:text-white">
              {request.projectTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E8F0FE] text-[#3978FF]">
              {request.status}
            </span>
          </div>
        </div>

        {/* Multi-Stage Milestone Pipeline Track */}
        <div className="p-5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-[#17172B] dark:text-white">CURRENT MILESTONE PIPELINE</span>
            <span className="text-[#7357FF]">Stage {currentIdx + 1} of 6</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
            {stages.map((stage, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div
                  key={stage.id}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-[#7357FF] text-white border-[#7357FF] shadow-sm'
                      : isPast
                      ? 'bg-[#EEE9FF] text-[#7357FF] border-[#D9D1FA]'
                      : 'bg-white dark:bg-[#1C1C33] text-[#8F91A3] border-[#E8EAF4] dark:border-[#2A2A46]'
                  }`}
                >
                  <p className="font-mono text-[11px] font-bold">{stage.label}</p>
                  <p className="text-[9px] opacity-80 mt-0.5 truncate">{stage.subtitle}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2-Column Content: AI Synthesis & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: AI Dossier & Features (~65% width) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* AI Scoping Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#7357FF]">
                <Cpu className="w-4 h-4" />
                <span>AI ARCHITECTURAL SCOPING</span>
              </div>
              <span className="text-[10px] font-mono text-[#10B981] font-bold">
                ✓ Gemini Synthesis Active
              </span>
            </div>

            <p className="text-xs text-[#17172B] dark:text-white leading-relaxed">
              {request.aiSummary || 'Unstructured project intake submitted. Gemini AI is processing architecture parameters and module checklists.'}
            </p>

            {/* Suggested Features Checklist */}
            {request.aiSuggestedFeatures && request.aiSuggestedFeatures.length > 0 && (
              <div className="pt-3 border-t border-[#F0F2F9] dark:border-[#202038] space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#65677A] block">
                  SYNTHESIZED MODULE CHECKLIST:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {request.aiSuggestedFeatures.map((f, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] flex items-center gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                      <span className="text-[#17172B] dark:text-white font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Audit & Activity Timeline Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
              <Clock className="w-4 h-4 text-[#7357FF]" />
              <h3 className="font-display font-bold text-sm text-[#17172B] dark:text-white">
                Project Audit Timeline
              </h3>
            </div>

            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] text-xs text-[#65677A]">
                  Initial intake registered. Awaiting administrator triage.
                </div>
              ) : (
                activities.map(act => (
                  <div key={act.id} className="p-3 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] text-xs flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#7357FF] mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-[#17172B] dark:text-white">{act.activityType || act.newStatus}</p>
                      <p className="text-[11px] text-[#65677A] mt-0.5">{act.userVisibleNote || `Status updated to ${act.newStatus}`}</p>
                      <span className="text-[9px] font-mono text-[#8F91A3]">{act.timestamp ? new Date(act.timestamp).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Spec Document & References (~35% width) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Spec Document Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F0F2F9] dark:border-[#202038]">
              <FileText className="w-4 h-4 text-[#7357FF]" />
              <h3 className="font-display font-bold text-sm text-[#17172B] dark:text-white">
                Specification Document
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F8FC] dark:bg-[#131326] border border-[#EEF0F8] dark:border-[#202038] space-y-1">
              <p className="text-xs font-bold text-[#17172B] dark:text-white truncate">
                {request.docFileName || `${request.projectTitle.toLowerCase().replace(/\s+/g, '_')}_spec.docx`}
              </p>
              <p className="text-[10px] font-mono text-[#8F91A3]">
                {request.docFileSize || '4.2 MB'} · Verified Dossier
              </p>
            </div>

            <div className="space-y-2">
              <BoxedButton
                variant="secondary"
                size="sm"
                fullWidth
                icon={<Eye className="w-3.5 h-3.5" />}
                onClick={() => setDocViewerOpen(true)}
              >
                Preview Document Spec
              </BoxedButton>

              <BoxedButton
                variant="primary"
                size="sm"
                fullWidth
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={() => {
                  if (request.docStoragePath) {
                    window.open(api.getDocumentDownloadUrl(request.docStoragePath), '_blank');
                  } else {
                    window.open('/templates/nexuscraft-project-brief-template.pdf', '_blank');
                  }
                }}
              >
                Download Official Spec
              </BoxedButton>
            </div>
          </div>

          {/* Reference Materials Card */}
          {request.referenceUrl && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#65677A]">
                SUBMITTED REFERENCE LINK
              </span>
              <a
                href={request.referenceUrl.startsWith('http') ? request.referenceUrl : `https://${request.referenceUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#7357FF] hover:underline flex items-center gap-1.5 truncate"
              >
                <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{request.referenceUrl}</span>
              </a>
            </div>
          )}

        </div>

      </div>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={docViewerOpen}
        onClose={() => setDocViewerOpen(false)}
        fileName={request.docFileName || `${request.projectTitle}_spec.docx`}
        fileUrl={request.docStoragePath ? api.getDocumentDownloadUrl(request.docStoragePath) : undefined}
      />

    </div>
  );
};

export default RequestDetailPage;
