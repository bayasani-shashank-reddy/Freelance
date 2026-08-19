import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { ArrowLeft, Sparkles, CheckCircle2, Bookmark, Send, ShieldCheck, MapPin, Building } from 'lucide-react';
import { SubmitProposalModal } from '../components/SubmitProposalModal';
import { useUser } from '../context/UserContext';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { savedJobIds, toggleSaveJob, dynamicJobs } = useUser();
  const [modalOpen, setModalOpen] = useState(false);

  const job = dynamicJobs.find((j) => j.id === id);
  const isSaved = job ? savedJobIds.includes(job.id) : false;

  if (!job) return <div className="pt-28 pb-24 text-center text-white min-h-screen">Job not found</div>;

  return (
    <div className="pt-28 pb-24 bg-slate-950 min-h-screen text-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/jobs')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold mb-6 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Marketplace</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Main Job Details */}
          <div className="space-y-8">
            <div className="glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {job.category}
                </span>
                <span className="text-xs font-mono text-slate-400">Posted {job.postedAt}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 py-4 border-y border-slate-800/80 my-6 text-sm font-mono">
                <div>
                  <div className="text-xs text-slate-500 uppercase">Budget ({job.budgetType})</div>
                  <div className="text-lg font-extrabold text-emerald-400">
                    {job.budgetType === 'Fixed'
                      ? `$${job.minBudget.toLocaleString()} - $${job.maxBudget.toLocaleString()}`
                      : `$${job.minBudget}/hr - $${job.maxBudget}/hr`}
                  </div>
                </div>

                <div className="h-8 w-[1px] bg-slate-800 hidden sm:block" />

                <div>
                  <div className="text-xs text-slate-500 uppercase">Project Duration</div>
                  <div className="text-sm font-bold text-slate-200">{job.duration}</div>
                </div>

                <div className="h-8 w-[1px] bg-slate-800 hidden sm:block" />

                <div>
                  <div className="text-xs text-slate-500 uppercase">Experience Level</div>
                  <div className="text-sm font-bold text-indigo-300">{job.experienceLevel}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Project Description & Requirements</h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Skills Required */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase mb-3">Required Tech Stack & Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono bg-indigo-600/10 text-cyan-300 border border-indigo-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Budget & Timeline Estimator Widget */}
            <div className="glass-card border border-indigo-500/30 rounded-3xl p-6 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">Nexus AI Budget & Timeline Intelligence</h3>
              </div>
              <p className="text-xs text-slate-300 mb-4">
                Based on current market rate telemetry and complexity analysis for <strong className="text-cyan-300">{job.category}</strong>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-500 mb-1">RECOMMENDED PROPOSAL BUDGET</div>
                  <div className="text-base font-bold text-emerald-400">${job.maxBudget - 500} - ${job.maxBudget}</div>
                  <div className="text-[10px] text-slate-400 mt-1">High conversion win rate within client expectation</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-500 mb-1">ESTIMATED TIMELINE</div>
                  <div className="text-base font-bold text-indigo-300">3 - 4 Weeks</div>
                  <div className="text-[10px] text-slate-400 mt-1">Includes design sprint, code handoff & testing</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info & Actions */}
          <div className="space-y-6">
            <div className="glass-card border border-slate-800/80 rounded-3xl p-6 space-y-6">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Send className="w-4 h-4" />
                <span>Apply to Project</span>
              </button>

              <button
                onClick={() => toggleSaveJob(job.id)}
                className={`w-full py-3 rounded-2xl border font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                  isSaved
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
                <span>{isSaved ? 'Saved in Bookmarks' : 'Save Job Posting'}</span>
              </button>

              <hr className="border-slate-800" />

              {/* Client Profile Card */}
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase mb-4">About Client</h4>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={job.clientAvatar}
                    alt={job.clientName}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-800"
                  />
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {job.clientName}
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    </h5>
                    <div className="text-xs text-amber-400 font-bold font-mono">
                      ★ {job.clientRating} Client Rating
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Payment Method Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-400" />
                    <span>$140k+ Total Platform Spend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>San Francisco, CA (PST)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <SubmitProposalModal
          jobId={job.id}
          jobTitle={job.title}
          maxBudget={job.maxBudget}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default JobDetailPage;
