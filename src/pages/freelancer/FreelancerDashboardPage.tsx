import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import {
  Briefcase,
  FileCheck,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Award,
  TrendingUp,
  BarChart2,
  Target,
  Cpu,
  Palette,
  Code2,
  Globe,
  Smartphone,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const WEEKLY_EARNINGS = [
  { day: 'Mon', amount: 1200 },
  { day: 'Tue', amount: 2800 },
  { day: 'Wed', amount: 1900 },
  { day: 'Thu', amount: 3400 },
  { day: 'Fri', amount: 2600 },
  { day: 'Sat', amount: 800 },
  { day: 'Sun', amount: 600 },
];

const SKILL_BARS = [
  { skill: 'React & Next.js', icon: <Code2 className="w-3.5 h-3.5" />, proficiency: 98, demand: 94, color: 'from-cyan-500 to-blue-500' },
  { skill: 'UI/UX Design', icon: <Palette className="w-3.5 h-3.5" />, proficiency: 92, demand: 88, color: 'from-pink-500 to-purple-500' },
  { skill: 'AI / PyTorch', icon: <Cpu className="w-3.5 h-3.5" />, proficiency: 85, demand: 96, color: 'from-indigo-500 to-violet-500' },
  { skill: 'Node.js / APIs', icon: <Globe className="w-3.5 h-3.5" />, proficiency: 90, demand: 82, color: 'from-emerald-500 to-teal-500' },
  { skill: 'Mobile (iOS/Android)', icon: <Smartphone className="w-3.5 h-3.5" />, proficiency: 72, demand: 78, color: 'from-orange-500 to-amber-500' },
  { skill: 'Design Systems', icon: <Layers className="w-3.5 h-3.5" />, proficiency: 88, demand: 80, color: 'from-yellow-500 to-orange-500' },
];

const MiniEarningsChart: React.FC = () => {
  const maxAmt = Math.max(...WEEKLY_EARNINGS.map((e) => e.amount));
  return (
    <div className="flex items-end gap-1.5 h-20 mt-4">
      {WEEKLY_EARNINGS.map((d, i) => {
        const heightPct = (d.amount / maxAmt) * 100;
        return (
          <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
            <MotionDiv
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: `${heightPct}%`, transformOrigin: 'bottom' }}
              className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-cyan-400 opacity-80 hover:opacity-100 transition-opacity cursor-pointer relative group"
              title={`$${d.amount.toLocaleString()}`}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white bg-slate-800 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ${d.amount.toLocaleString()}
              </div>
            </MotionDiv>
            <span className="text-[9px] font-mono text-slate-500">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
};

const SkillProgressBar: React.FC<{ skill: (typeof SKILL_BARS)[0]; index: number }> = ({ skill, index }) => {
  return (
    <MotionDiv
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <span className="text-slate-400">{skill.icon}</span>
          <span>{skill.skill}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="text-cyan-400">{skill.proficiency}% proficient</span>
          <span className="text-slate-600">|</span>
          <span className="text-purple-400">{skill.demand}% market demand</span>
        </div>
      </div>
      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
        {/* Demand background */}
        <div className="absolute inset-0 bg-purple-500/20" style={{ width: `${skill.demand}%` }} />
        {/* Proficiency bar */}
        <MotionDiv
          initial={{ width: 0 }}
          animate={{ width: `${skill.proficiency}%` }}
          transition={{ duration: 1.2, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full bg-gradient-to-r ${skill.color} relative`}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-sm -mr-1" />
        </MotionDiv>
      </div>
    </MotionDiv>
  );
};

export const FreelancerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, dynamicJobs, dynamicProposals } = useUser();
  const { showToast } = useToast();
  const [deliverableModal, setDeliverableModal] = useState(false);
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const assignedJobs = dynamicJobs.filter(
    (j) => j.assignedFreelancerId === user?.id || j.assignedFreelancerName?.toLowerCase() === (user?.name || '').toLowerCase()
  );

  const myProposals = dynamicProposals.filter(
    (p) => p.freelancerName?.toLowerCase() === (user?.name || '').toLowerCase() || p.freelancerId === user?.id
  );

  const weeklyTotal = WEEKLY_EARNINGS.reduce((s, d) => s + d.amount, 0);

  const handleUploadDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    setDeliverableModal(false);
    setDeliverableTitle('');
    setDeliverableUrl('');
    showToast({
      type: 'success',
      title: 'Deliverable Submitted!',
      message: `"${deliverableTitle}" has been sent. Client notified for milestone review.`,
    });
    setSuccessMsg(`Deliverable "${deliverableTitle}" submitted successfully! Client notified for milestone review.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="pt-28 pb-24 bg-slate-950 min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mb-2">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>FREELANCER PORTAL // ACTIVE ENGINE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">{user?.name || 'Elena Rostova'}</span>
            </h1>
            
            {/* Enhanced Freelancer Attributes */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user?.verificationBadge || 'Nexus Vetted AI Architect (Top 1%)'}</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Trust Score: {user?.trustScore || 99}%</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span>Monthly Goal Target: $25,000 (73.6% Achieved)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/jobs')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-bold"
            >
              Find Opportunities
            </button>

            <button
              onClick={() => setDeliverableModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Submit Deliverable</span>
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dynamic Key Performance Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-300 font-bold uppercase mb-1">TOTAL EARNINGS</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              ${(user?.balance || 18400).toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 font-semibold mt-1">Cleared payouts</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-300 font-bold uppercase mb-1">PENDING ESCROW</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">
              ${(user?.escrowBalance || 4200).toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-cyan-400 font-semibold mt-1">Held in milestones</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-300 font-bold uppercase mb-1">ACTIVE CONTRACTS</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 font-mono">
              {assignedJobs.length}
            </div>
            <div className="text-[10px] font-mono text-indigo-300 font-semibold mt-1">In progress</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-300 font-bold uppercase mb-1">PROPOSAL WIN RATE</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">
              94%
            </div>
            <div className="text-[10px] font-mono text-purple-300 font-semibold mt-1">★ 4.98 Rating</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 glass-card border border-slate-800 rounded-3xl p-6 sm:p-8 bg-slate-900/95 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <span>My Active Client Contracts</span>
              </h2>
              <button onClick={() => navigate('/jobs')} className="text-xs text-cyan-400 font-bold hover:underline">
                Find More Work →
              </button>
            </div>

            {assignedJobs.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 font-mono">
                No active assigned contracts. Browse the marketplace to submit proposals.
              </div>
            ) : (
              <div className="space-y-4">
                {assignedJobs.map((job) => (
                  <div key={job.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-base">{job.title}</h3>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ● CONTRACT ACTIVE
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{job.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs font-mono">
                      <span className="text-slate-400">Client: <strong className="text-white">{job.clientName}</strong></span>
                      <span className="text-emerald-400 font-bold">${job.maxBudget.toLocaleString()} Escrow</span>
                      <button
                        onClick={() => navigate(`/workspace/${job.id}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                      >
                        Open Workspace
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proposal Tracker */}
          <div className="glass-card border border-slate-800 rounded-3xl p-6 sm:p-8 bg-slate-900/95 space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-400" />
              <span>Submitted Proposals</span>
            </h2>

            <div className="space-y-3">
              {myProposals.slice(0, 4).map((prop) => (
                <div key={prop.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span className="truncate max-w-[180px]">{prop.jobTitle}</span>
                    <span className="text-emerald-400 font-mono">${prop.proposedBudget}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>{prop.submittedAt}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                      {prop.status}
                    </span>
                  </div>
                </div>
              ))}
              {myProposals.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500 font-mono bg-slate-950 rounded-xl border border-slate-800">
                  No proposals submitted yet. Browse jobs to apply!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NEW: Skill Progress Bars + Weekly Earnings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Skill Progress Bars */}
          <div className="glass-card border border-slate-800 rounded-3xl p-6 sm:p-8 bg-slate-900/95 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-pink-400" />
                <span>Skill Market Insights</span>
              </h2>
              <div className="flex items-center gap-4 text-[10px] font-mono">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" /><span className="text-slate-400">Proficiency</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500/60" /><span className="text-slate-400">Market Demand</span></div>
              </div>
            </div>
            <div className="space-y-4">
              {SKILL_BARS.map((s, i) => (
                <SkillProgressBar key={s.skill} skill={s} index={i} />
              ))}
            </div>
          </div>

          {/* Weekly Earnings Mini Chart */}
          <div className="glass-card border border-slate-800 rounded-3xl p-6 sm:p-8 bg-slate-900/95 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-cyan-400" />
                <span>Weekly Earnings</span>
              </h2>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">${weeklyTotal.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 font-mono">This week</div>
              </div>
            </div>

            <MiniEarningsChart />

            <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-extrabold text-white font-mono">${WEEKLY_EARNINGS[3].amount.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 font-mono">Best Day</div>
              </div>
              <div>
                <div className="text-lg font-extrabold text-cyan-400 font-mono">+12.4%</div>
                <div className="text-[10px] text-slate-400 font-mono">vs Last Week</div>
              </div>
              <div>
                <div className="text-lg font-extrabold text-purple-400 font-mono">7</div>
                <div className="text-[10px] text-slate-400 font-mono">Active Days</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Deliverable Modal */}
      {deliverableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card border border-cyan-500/30 p-8 rounded-3xl space-y-5 bg-slate-900/95 text-xs">
            <h2 className="text-xl font-bold text-white">Submit Project Deliverable</h2>
            <form onSubmit={handleUploadDeliverable} className="space-y-4">
              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Deliverable Name / Milestone Title:</label>
                <input
                  type="text"
                  required
                  value={deliverableTitle}
                  onChange={(e) => setDeliverableTitle(e.target.value)}
                  placeholder="e.g. Master Figma Design & Shader v2.4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Deliverable URL / Storage Link:</label>
                <input
                  type="url"
                  required
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  placeholder="https://github.com/org/repo or Figma link"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeliverableModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-extrabold"
                >
                  Submit Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerDashboardPage;
