import React, { useState } from 'react';
import { Search, Filter, Bookmark, Sparkles, Clock, ArrowRight, Plus, X, Send, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import confetti from 'canvas-confetti';
import type { JobListing } from '../types';

export const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { savedJobIds, toggleSaveJob, dynamicJobs, postNewJob, user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState<'All' | 'Fixed' | 'Hourly'>('All');
  const [minBudgetFilter] = useState<number>(0);

  // Post Job Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [newJobData, setNewJobData] = useState({
    title: '',
    category: 'Web Development',
    budgetType: 'Fixed' as 'Fixed' | 'Hourly',
    minBudget: 500,
    maxBudget: 2500,
    duration: '2-4 weeks',
    description: '',
    skills: 'React, Node.js, UI/UX Design',
  });

  const categories = ['All', 'Web Development', 'Mobile Development', 'Fintech / Web3', 'UI/UX Design', 'AI / ML Studio'];

  const filteredJobs = dynamicJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
    const matchesType = selectedType === 'All' || job.budgetType === selectedType;
    const matchesBudget = job.maxBudget >= minBudgetFilter;

    return matchesSearch && matchesCategory && matchesType && matchesBudget;
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobData.title.trim() || !newJobData.description.trim()) return;

    const job: JobListing = {
      id: `job-${Date.now()}`,
      title: newJobData.title,
      clientName: user?.name || 'Alex Rivera',
      clientAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      clientRating: 4.9,
      category: newJobData.category,
      description: newJobData.description,
      budgetType: newJobData.budgetType,
      minBudget: newJobData.minBudget,
      maxBudget: newJobData.maxBudget,
      duration: newJobData.duration,
      experienceLevel: 'Intermediate',
      skills: newJobData.skills.split(',').map((s) => s.trim()),
      proposalsCount: 0,
      postedAt: 'Just now',
      status: 'Open',
      isRemote: true,
    };

    postNewJob(job);
    setModalOpen(false);
    setNewJobData({
      title: '',
      category: 'Web Development',
      budgetType: 'Fixed',
      minBudget: 500,
      maxBudget: 2500,
      duration: '2-4 weeks',
      description: '',
      skills: 'React, Node.js, UI/UX Design',
    });
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
  };

  return (
    <div className="pt-28 pb-24 bg-slate-950 min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>FREELANCER MARKETPLACE // 100% ESCROW PROTECTED</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Browse Open <span className="gradient-text">Projects & Client Briefs</span>
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl font-medium">
              Apply to vetted SaaS startups, Web3 protocols, and enterprise tech founders with milestone escrow protection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white text-xs font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>+ Post New Job</span>
            </button>

            <button
              onClick={() => navigate('/proposals')}
              className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-bold font-mono flex items-center gap-2 transition-all"
            >
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>My Proposals</span>
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="glass-card border border-slate-800 rounded-3xl p-6 mb-8 space-y-4 bg-slate-900/95">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, tech stack, skills, or keyword..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-slate-300 font-bold uppercase">Budget Type:</span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['All', 'Fixed', 'Hourly'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedType === t
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings Feed */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16 glass-card border border-slate-800 rounded-3xl bg-slate-900/95 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Live Jobs Listed Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Be the first to post a job requirement or project brief on NexusCraft! Verified freelancers will submit custom proposals in real time.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold text-xs shadow-lg"
              >
                + Post a Project Requirement
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isSaved = savedJobIds.includes(job.id);
              return (
                <div
                  key={job.id}
                  className="glass-card border border-slate-800 rounded-3xl p-6 bg-slate-900/95 hover:border-slate-700 transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={job.clientAvatar}
                            alt={job.clientName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">{job.clientName}</span>
                            <span className="text-[10px] font-mono text-cyan-300">★ {job.clientRating} • {job.category}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleSaveJob(job.id)}
                          className={`p-2 rounded-xl border transition-all ${
                            isSaved
                              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>

                      <h3
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        {job.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap items-center gap-2">
                        {job.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-950 text-cyan-300 border border-slate-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800 gap-4 shrink-0">
                      <div className="text-left lg:text-right">
                        <div className="text-xs font-mono text-slate-400 font-bold uppercase">{job.budgetType} BUDGET</div>
                        <div className="text-xl font-extrabold text-emerald-400 font-mono">
                          ${job.minBudget.toLocaleString()} – ${job.maxBudget.toLocaleString()}
                        </div>
                        <div className="text-xs font-mono text-slate-300">{job.duration} • {job.proposalsCount} Proposals</div>
                      </div>

                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 hover:scale-105 transition-all"
                      >
                        <span>View Requirements</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Post New Job Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg glass-card border border-cyan-500/30 p-8 rounded-3xl space-y-6 shadow-2xl bg-slate-900/95 text-xs">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">Post a New Job Requirement</h2>
              <p className="text-slate-300 text-xs mt-1">Create a live project listing for top freelancers to submit proposals.</p>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Project Title:</label>
                <input
                  type="text"
                  required
                  value={newJobData.title}
                  onChange={(e) => setNewJobData({ ...newJobData, title: e.target.value })}
                  placeholder="e.g. Build Fast-Food Restaurant Website with Online Cart & Delivery"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-300 font-bold mb-1">Category:</label>
                  <select
                    value={newJobData.category}
                    onChange={(e) => setNewJobData({ ...newJobData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Fintech / Web3">Fintech / Web3</option>
                    <option value="AI / ML Studio">AI / ML Studio</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-slate-300 font-bold mb-1">Max Budget ($):</label>
                  <input
                    type="number"
                    required
                    value={newJobData.maxBudget}
                    onChange={(e) => setNewJobData({ ...newJobData, maxBudget: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Required Skills (comma separated):</label>
                <input
                  type="text"
                  value={newJobData.skills}
                  onChange={(e) => setNewJobData({ ...newJobData, skills: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-300 font-bold mb-1">Detailed Description:</label>
                <textarea
                  rows={4}
                  required
                  value={newJobData.description}
                  onChange={(e) => setNewJobData({ ...newJobData, description: e.target.value })}
                  placeholder="Describe your project scope, features, and key requirements..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Publish Job Listing Live</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
