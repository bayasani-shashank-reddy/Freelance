import React, { useState } from 'react';
import type { ServicePackage } from '../types';
import { useUser } from '../context/UserContext';
import confetti from 'canvas-confetti';
import { CheckCircle, MapPin, Sparkles, ArrowLeft, Send, Check, ShieldCheck } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

export const DesignerProfilePage: React.FC = () => {
  const { id: designerId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { approvedFreelancers } = useUser();
  const foundFreelancer = approvedFreelancers.find(d => d.id === designerId);
  const designer = foundFreelancer ? {
    id: foundFreelancer.id,
    name: foundFreelancer.name,
    avatar: foundFreelancer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    title: foundFreelancer.title || 'Senior Freelancer',
    location: 'Remote',
    bio: foundFreelancer.bio || 'Verified NexusCraft Freelancer.',
    specialties: foundFreelancer.skills || ['Full Stack', 'UI/UX'],
    hourlyRate: 85,
    rating: 5.0,
    reviewsCount: 1,
    availability: 'Available Now' as const,
    completedProjects: foundFreelancer.completedContracts || 0,
    earnedTotal: '$0',
    topSkills: foundFreelancer.skills || ['React', 'Node.js'],
    verified: true,
    badge: 'TOP RATED',
    portfolioItems: [] as any[],
    servicePackages: [] as any[],
    packages: [] as any[],
    stats: {
      completedProjects: foundFreelancer?.completedContracts || 0,
      clientSatisfaction: 100,
      responseTime: '< 1 hr',
      repeatHireRate: '100%',
    },
    reviews: [] as any[],
  } : null;

  const [activeTab, setActiveTab] = useState<'portfolio' | 'packages' | 'reviews'>('portfolio');
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  if (!designer) {
    return <div className="pt-28 pb-24 text-center text-white min-h-screen">Designer not found</div>;
  }

  // Proposal Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [projectBudget, setProjectBudget] = useState(3800);
  const [projectMessage, setProjectMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    triggerConfetti();

    setTimeout(() => {
      setIsSubmitted(false);
      setRequestModalOpen(false);
      navigate('/dashboard');
    }, 2200);
  };

  return (
    <div className="pt-24 pb-24 bg-slate-950 min-h-screen text-slate-200">
      {/* Top Navigation Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Designer Directory</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Banner & Header Card */}
        <div className="rounded-3xl glass-card border border-slate-800/90 shadow-2xl overflow-hidden mb-10">
          {/* Cover Image */}
          <div className="h-48 sm:h-64 w-full relative overflow-hidden bg-slate-900">
            <img src={designer.coverImage} alt="Cover" className="w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          {/* Profile Header Info */}
          <div className="px-6 sm:px-10 relative -mt-16 sm:-mt-20 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              <div className="relative">
                <img
                  src={designer.avatar}
                  alt={designer.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-slate-950 shadow-2xl"
                />
                <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-4 border-slate-950" title="Online" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{designer.name}</h1>
                  <CheckCircle className="w-6 h-6 text-cyan-400" />
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {designer.badge}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-300 mb-2">{designer.title}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-2">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    ★ {designer.rating} ({designer.reviewsCount} Verified Client Reviews)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-cyan-300 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    NexusScore: 96/100
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {designer.location}
                  </span>
                </div>

                {/* Verified Badges Row */}
                <div className="flex flex-wrap gap-2 mt-3 text-[10px] font-mono">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">✓ Identity Verified</span>
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">✓ 3D WebGL Skill Verified</span>
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold">✓ Top Rated 1%</span>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setProjectBudget(designer.packages[0]?.price || 3800);
                  setRequestModalOpen(true);
                }}
                className="py-4 px-8 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Request Project Proposal</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-800/80 bg-slate-900/60 font-mono text-center divide-x divide-slate-800/80">
            <div className="p-4">
              <span className="text-xs text-slate-400 block mb-1">JOB SUCCESS RATE</span>
              <span className="text-xl font-extrabold text-emerald-400">{designer.stats.clientSatisfaction}%</span>
            </div>
            <div className="p-4">
              <span className="text-xs text-slate-400 block mb-1">COMPLETED SHIPS</span>
              <span className="text-xl font-extrabold text-white">{designer.stats.completedProjects}+</span>
            </div>
            <div className="p-4">
              <span className="text-xs text-slate-400 block mb-1">AVG RESPONSE TIME</span>
              <span className="text-xl font-extrabold text-cyan-400">{designer.stats.responseTime}</span>
            </div>
            <div className="p-4">
              <span className="text-xs text-slate-400 block mb-1">HOURLY RATE</span>
              <span className="text-xl font-extrabold text-purple-400">${designer.hourlyRate}/hr</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-slate-800 mb-8 pb-3">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'portfolio'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Portfolio Gallery ({designer.portfolioItems.length})
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'packages'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Engagement Packages ({designer.packages.length})
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'reviews'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Client Reviews ({designer.reviews.length})
          </button>
        </div>

        {/* Tab Content: Portfolio */}
        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designer.portfolioItems.map((item) => (
              <div key={item.id} className="rounded-2xl glass-card border border-slate-800 overflow-hidden group">
                <div className="h-60 relative overflow-hidden bg-slate-900">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-950/80 text-cyan-300 border border-cyan-500/30">
                    {item.category}
                  </span>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-white text-base mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.description}</p>
                  <span className="text-xs font-mono font-semibold text-emerald-400 block mb-3">⚡ {item.metrics}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Packages */}
        {activeTab === 'packages' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {designer.packages.map((pkg: ServicePackage) => (
              <div
                key={pkg.id}
                className={`p-6 sm:p-8 rounded-3xl glass-card border flex flex-col justify-between relative overflow-hidden ${
                  pkg.popular ? 'border-cyan-400 shadow-2xl shadow-cyan-500/15' : 'border-slate-800'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    MOST POPULAR
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-extrabold text-white mb-2">{pkg.name}</h3>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">{pkg.description}</p>

                  <div className="mb-6 font-mono">
                    <span className="text-3xl font-extrabold text-white">${pkg.price.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 block font-sans mt-1">Delivery in {pkg.duration}</span>
                  </div>

                  <ul className="space-y-2.5 mb-8">
                    {pkg.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setProjectBudget(pkg.price);
                    setRequestModalOpen(true);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Select {pkg.name}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {designer.reviews.length === 0 ? (
              <p className="text-slate-400 text-sm italic">No written client reviews yet.</p>
            ) : (
              designer.reviews.map((rev) => (
                <div key={rev.id} className="p-6 rounded-2xl glass-card border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img src={rev.clientAvatar} alt={rev.clientName} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                      <div>
                        <h4 className="font-bold text-white text-sm">{rev.clientName}</h4>
                        <span className="text-xs text-slate-400">{rev.company}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-amber-400 text-xs">
                        {'★'.repeat(rev.rating)}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{rev.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">"{rev.text}"</p>
                  <span className="text-[10px] font-mono text-cyan-400">Verified Project: {rev.projectTitle}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Request Project Custom Proposal Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl">
          <div className="relative w-full max-w-xl rounded-3xl glass-card-glow border border-cyan-500/40 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setRequestModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            >
              ✕
            </button>

            {isSubmitted ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Proposal Sent to {designer.name}!</h3>
                <p className="text-slate-400 text-sm">
                  Funds have been allocated into Escrow. Redirecting to your Client Dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendProposal} className="space-y-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>100% Escrow Protection Guaranteed</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">Hire {designer.name}</h3>
                  <p className="text-slate-400 text-xs">Fill in your proposal details below to start the escrow sprint.</p>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. NextGen SaaS Dashboard Redesign"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Escrow Budget ($)</label>
                  <input
                    type="number"
                    required
                    value={projectBudget}
                    onChange={(e) => setProjectBudget(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono font-bold text-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Project Requirements & Timeline</label>
                  <textarea
                    required
                    rows={4}
                    value={projectMessage}
                    onChange={(e) => setProjectMessage(e.target.value)}
                    placeholder="Describe your design goals, target launch date, and deliverables..."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Proposal & Allocate Escrow (${projectBudget.toLocaleString()})</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
