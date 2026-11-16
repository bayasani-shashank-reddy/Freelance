import React from 'react';
import { ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AdminAttentionQueueProps {
  projects: any[];
  quotations: any[];
  deliverables: any[];
  clarifications: any[];
  onOpenDrawer: (projectId: string) => void;
}

export const AdminAttentionQueue: React.FC<AdminAttentionQueueProps> = ({
  projects,
  quotations,
  deliverables,
  clarifications,
  onOpenDrawer
}) => {
  const now = Date.now();

  // 1. Calculate 24-hour review target for submissions
  const attentionItems: any[] = [];

  // Urgent & approaching deadline submissions
  projects.forEach(p => {
    const isUrgent = p.priority === 'Urgent';
    const isSubmitted = p.status === 'Submitted' || p.status === 'New';
    
    // Check 24-hour review target
    const createdTime = p.timestamp ? new Date(p.timestamp).getTime() : 0;
    const deadlineTime = p.reviewDeadline ? new Date(p.reviewDeadline).getTime() : (createdTime + 24 * 60 * 60 * 1000);
    const isOverdue = isSubmitted && now > deadlineTime;
    const remainingMs = deadlineTime - now;
    const hoursRemaining = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
    const minutesRemaining = Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)));

    if (isUrgent || isOverdue || (isSubmitted && hoursRemaining <= 6)) {
      attentionItems.push({
        id: p.customId || p.id,
        projectId: p.customId || p.id,
        type: isOverdue ? 'overdue' : (isUrgent ? 'urgent' : 'approaching_deadline'),
        badge: isOverdue ? 'Overdue Review' : (isUrgent ? 'Urgent Priority' : 'Target < 6h'),
        title: p.projectTitle,
        category: p.aiCategory || 'Web Product',
        details: isOverdue
          ? `Overdue by ${Math.floor((now - deadlineTime) / (1000 * 60 * 60))}h ${Math.floor(((now - deadlineTime) % (1000 * 60 * 60)) / (1000 * 60))}m (24h review target exceeded)`
          : `24h Target: ${hoursRemaining}h ${minutesRemaining}m remaining for triage`,
        priority: isUrgent ? 'Urgent' : 'High',
        actionLabel: 'Triage Submission'
      });
    }

    // Unassigned approved projects
    if (p.status === 'Specialist Review' && (!p.assignedFreelancerId || p.assignedFreelancerId === '')) {
      attentionItems.push({
        id: `unassigned-${p.customId || p.id}`,
        projectId: p.customId || p.id,
        type: 'unassigned',
        badge: 'Unassigned Specialist',
        title: p.projectTitle,
        category: p.aiCategory || 'Web Product',
        details: 'Approved for specialist review but no freelancer has been assigned yet.',
        priority: 'Normal',
        actionLabel: 'Assign Specialist'
      });
    }
  });

  // ZIP deliverables awaiting inspection
  deliverables.filter(d => d.status === 'Submitted' || d.status === 'Under Review').forEach(d => {
    attentionItems.push({
      id: `deliv-${d.customId}`,
      projectId: d.projectId,
      type: 'deliverable_inspection',
      badge: `ZIP Inspection v${d.version}`,
      title: `${d.projectTitle || 'Deliverable'}: ${d.submissionTitle}`,
      category: `${d.zipFileSize} • ${d.fileCount} files`,
      details: `Uploaded by ${d.freelancerName}. Package structure and SHA-256 awaiting release decision.`,
      priority: 'High',
      actionLabel: 'Inspect Package'
    });
  });

  // Quotations awaiting decision
  quotations.filter(q => q.status === 'Submitted' || q.status === 'Under Review').forEach(q => {
    attentionItems.push({
      id: `quote-${q.customId}`,
      projectId: q.requestId,
      type: 'quotation_decision',
      badge: 'Quotation Decision',
      title: `${q.projectTitle || 'Project'} — ₹${(q.totalCost || 0).toLocaleString('en-IN')}`,
      category: `${q.estimatedTimeline || '4 Weeks'}`,
      details: `Submitted by ${q.freelancerName}. Requires commercial approval and client price determination.`,
      priority: 'High',
      actionLabel: 'Review Quotation'
    });
  });

  // Clarifications awaiting client or admin
  clarifications.filter(c => c.status === 'Pending').forEach(c => {
    attentionItems.push({
      id: `clarif-${c.customId || c.id}`,
      projectId: c.requestId || c.projectId,
      type: 'clarification',
      badge: 'Clarification Pending',
      title: c.question,
      category: 'Client Q&A',
      details: `Project: ${c.projectTitle || c.requestId}. Response awaiting review.`,
      priority: 'Normal',
      actionLabel: 'Open Thread'
    });
  });

  if (attentionItems.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] flex items-center justify-between text-xs text-[#65677A] dark:text-[#A6A8C0]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span className="font-semibold text-[#17172B] dark:text-white">High-Priority Queue Clear:</span>
          <span>No urgent submissions or overdue 24h review deadlines. All pipelines are healthy.</span>
        </div>
        <span className="text-[10px] font-mono text-[#10B981] font-bold">100% OPERATIONAL SLA</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-transparent to-red-500/5 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h3 className="font-display font-extrabold text-sm sm:text-base text-[#17172B] dark:text-white">
            High-Priority Attention Queue ({attentionItems.length})
          </h3>
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
            Action Required
          </span>
        </div>
        <span className="text-[11px] text-[#65677A] dark:text-[#A6A8C0] hidden sm:inline">
          Sorted by operational urgency & 24h target
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {attentionItems.slice(0, 6).map(item => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border bg-white dark:bg-[#1A1A30] shadow-sm flex flex-col justify-between space-y-2 transition-all hover:shadow-md ${
              item.type === 'overdue'
                ? 'border-red-300 dark:border-red-500/40'
                : 'border-[#E8EAF4] dark:border-[#2A2A46]'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                  item.type === 'overdue'
                    ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                    : (item.priority === 'Urgent'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-[#EEE9FF] dark:bg-[#201F3E] text-[#7357FF]')
                }`}>
                  {item.badge}
                </span>
                <span className="text-[10px] text-[#8F91A3] font-mono truncate max-w-[120px]">
                  {item.category}
                </span>
              </div>

              <h4 className="text-xs font-bold text-[#17172B] dark:text-white leading-snug line-clamp-1">
                {item.title}
              </h4>
              <p className="text-[10px] text-[#65677A] dark:text-[#A6A8C0] line-clamp-2 leading-relaxed">
                {item.details}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenDrawer(item.projectId)}
              className="w-full mt-2 py-1.5 px-2.5 rounded-lg bg-[#F7F8FC] dark:bg-[#131326] hover:bg-[#7357FF] hover:text-white border border-[#E8EAF4] dark:border-[#2A2A46] text-[#17172B] dark:text-[#E2E4F0] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{item.actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAttentionQueue;