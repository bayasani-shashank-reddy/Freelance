import React from 'react';
import { useUser } from '../context/UserContext';
import { Sparkles, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CompareFreelancersPage: React.FC = () => {
  const navigate = useNavigate();
  const { compareDesignerIds, toggleCompareDesigner, clearCompare, approvedFreelancers } = useUser();

  const allFreelancers = approvedFreelancers.map((f) => ({
    id: f.id,
    name: f.name,
    avatar: f.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: f.title || 'Senior Freelancer Specialist',
    location: 'Remote',
    bio: f.bio || 'Verified NexusCraft Freelance Architect.',
    specialties: f.skills || ['Full Stack', 'UI/UX'],
    hourlyRate: 85,
    rating: 5.0,
    reviewsCount: 1,
    availability: 'Available Now' as const,
    completedProjects: f.completedContracts || 0,
    earnedTotal: '$0',
    topSkills: f.skills || ['React', 'Node.js'],
    verified: true,
    badge: 'TOP RATED',
    experienceYears: 5,
    stats: {
      jobSuccessRate: 100,
    }
  }));

  const selectedDesigners = allFreelancers.filter((d) => compareDesignerIds.includes(d.id));

  return (
    <div className="pt-28 pb-24 bg-slate-950 min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/designers')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold mb-3 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Directory</span>
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Compare <span className="gradient-text">Freelance Talent</span>
            </h1>
          </div>

          {selectedDesigners.length > 0 && (
            <button
              onClick={clearCompare}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs font-mono font-bold flex items-center gap-2 self-start sm:self-auto transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Selection ({selectedDesigners.length})</span>
            </button>
          )}
        </div>

        {selectedDesigners.length === 0 ? (
          <div className="glass-card border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto">
            <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Freelancers Selected for Comparison</h3>
            <p className="text-sm text-slate-400 mb-6">
              Select 2 to 3 designers from the directory to compare ratings, hourly rates, experience, and verified skills side-by-side.
            </p>
            <button
              onClick={() => navigate('/designers')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg"
            >
              Browse Talent Directory
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse glass-card border border-slate-800/80 rounded-3xl overflow-hidden">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/60">
                  <th className="p-6 text-xs font-mono text-slate-400 uppercase w-48">Feature</th>
                  {selectedDesigners.map((designer) => (
                    <th key={designer.id} className="p-6 min-w-[260px]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {designer.badge}
                        </span>
                        <button
                          onClick={() => toggleCompareDesigner(designer.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <img
                          src={designer.avatar}
                          alt={designer.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-800"
                        />
                        <div>
                          <span className="text-white font-bold">{designer.name}</span>
                          <div className="text-xs text-slate-400 line-clamp-1">{designer.title}</div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                <tr>
                  <td className="p-6 font-mono font-bold text-slate-400 text-xs uppercase bg-slate-900/30">NexusScore</td>
                  {selectedDesigners.map((d) => (
                    <td key={d.id} className="p-6 font-mono font-extrabold text-cyan-400 text-base">
                      96 / 100
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-6 font-mono font-bold text-slate-400 text-xs uppercase bg-slate-900/30">Hourly Rate</td>
                  {selectedDesigners.map((d) => (
                    <td key={d.id} className="p-6 font-mono font-bold text-emerald-400 text-base">
                      ${d.hourlyRate}/hr
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-6 font-mono font-bold text-slate-400 text-xs uppercase bg-slate-900/30">Rating & Reviews</td>
                  {selectedDesigners.map((d) => (
                    <td key={d.id} className="p-6 font-mono font-bold text-amber-400">
                      ★ {d.rating} ({d.reviewsCount} Reviews)
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-6 font-mono font-bold text-slate-400 text-xs uppercase bg-slate-900/30">Experience</td>
                  {selectedDesigners.map((d) => (
                    <td key={d.id} className="p-6 text-slate-200 font-medium">
                      {d.experienceYears} Years
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-6 font-mono font-bold text-slate-400 text-xs uppercase bg-slate-900/30">Job Success Rate</td>
                  {selectedDesigners.map((d) => (
                    <td key={d.id} className="p-6 font-mono font-bold text-indigo-300">
                      {d.stats.jobSuccessRate}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-6 font-mono font-bold text-slate-400 text-xs uppercase bg-slate-900/30">Availability</td>
                  {selectedDesigners.map((d) => (
                    <td key={d.id} className="p-6 font-mono text-xs font-bold text-emerald-400">
                      {d.availability}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-6 font-mono font-bold text-slate-400 text-xs uppercase bg-slate-900/30">Specialties</td>
                  {selectedDesigners.map((d) => (
                    <td key={d.id} className="p-6">
                      <div className="flex flex-wrap gap-1.5">
                        {d.specialties.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-6 bg-slate-900/30">Action</td>
                  {selectedDesigners.map((d) => (
                    <td key={d.id} className="p-6">
                      <button
                        onClick={() => navigate(`/designers/${d.id}`)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md"
                      >
                        View Full Profile
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareFreelancersPage;
