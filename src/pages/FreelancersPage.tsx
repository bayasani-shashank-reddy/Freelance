import React, { useEffect, useRef, useState } from 'react';

import { Search, MapPin, CheckCircle, Sparkles, ArrowRight, Scale, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { animate } from 'animejs/animation';
import { onScroll } from 'animejs/events';
import { createScope } from 'animejs/scope';
import { stagger } from 'animejs/utils';
import { useUser } from '../context/UserContext';

export const FreelancersPage: React.FC = () => {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxRate, setMaxRate] = useState<number>(200);

  const specialties = ['All', 'SaaS UI/UX', '3D WebGL', 'Mobile App', 'Design Systems', 'Web3 / DeFi'];

  const { approvedFreelancers, compareDesignerIds, toggleCompareDesigner } = useUser();

  const allFreelancers = approvedFreelancers.map((f) => ({
    id: f.id,
    name: f.name,
    avatar: f.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
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
    portfolioItems: [] as any[],
  }));

  const filteredDesigners = allFreelancers.filter((designer) => {
    const matchesSearch =
      designer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      designer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      designer.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      designer.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialty =
      selectedSpecialty === 'All' ||
      designer.specialties.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));

    const matchesAvailability = !availableOnly || designer.availability === 'Available Now';

    const matchesRate = designer.hourlyRate <= maxRate;

    return matchesSearch && matchesSpecialty && matchesAvailability && matchesRate;
  });


  useEffect(() => {
    const root = pageRef.current;
    const grid = gridRef.current;
    if (!root || !grid || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = Array.from(grid.querySelectorAll('.designer-card'));
    if (!cards.length) return;

    const scope = createScope({
      root,
      mediaQueries: {
        mobile: '(orientation: portrait), (hover: none), (pointer: coarse)',
        desktop: '(hover: hover) and (pointer: fine)',
      },
    }).add((self) => {
      let latestVelocity = 0;
      const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
      const rows = Math.ceil(cards.length / columns);
      const isMobile = Boolean(self?.matches.mobile);

      animate(cards, { opacity: 0, scale: isMobile ? 0.96 : 0, duration: 1 });

      onScroll({
        target: grid,
        enter: 'bottom-=10 top',
        onUpdate: (observer) => {
          latestVelocity = Math.abs(observer.velocity);
        },
        onEnter: () => {
          const speed = Math.min(1, latestVelocity / 2600);
          const duration = isMobile ? 420 : 900 - speed * 420;

          animate('.designer-card', {
            scale: [isMobile ? 0.96 : 0, 1],
            opacity: [0, 1],
            delay: stagger(isMobile ? 35 : 80, {
              grid: [columns, rows],
              from: 'center',
            }),
            duration,
            ease: 'outExpo',
          });
        },
      });
    });

    return () => scope.revert();
  }, [filteredDesigners.length]);

  return (
    <div ref={pageRef} data-section-theme="designers" className="pt-28 pb-24 bg-slate-950 min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>TOP 1% VERIFIED FREELANCE TALENT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Browse Verified <span className="gradient-text">Product Designers</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Hire elite web/app designers, 3D artists, & design system architects with 100% escrow protection.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-6 rounded-3xl glass-card border border-slate-800/90 shadow-2xl mb-10 space-y-4">
          {/* Top Row: Search Input & Availability Toggle */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by designer name, skill (e.g. 3D WebGL, Figma, iOS)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
              />
            </div>

            {/* Availability Checkbox Toggle */}
            <label className="flex items-center gap-2 cursor-pointer px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white shrink-0">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available Now Only</span>
            </label>

            {/* Rate Slider */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 shrink-0 w-full md:w-auto">
              <span>Max Rate:</span>
              <input
                type="range"
                min={50}
                max={250}
                step={10}
                value={maxRate}
                onChange={(e) => setMaxRate(Number(e.target.value))}
                className="accent-cyan-400 cursor-pointer"
              />
              <span className="font-mono font-bold text-cyan-400">${maxRate}/hr</span>
            </div>
          </div>

          {/* Specialty Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800/60">
            <span className="text-xs font-mono text-slate-400 shrink-0 mr-2">SPECIALTY:</span>
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedSpecialty === spec
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md font-semibold'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Designer Grid */}
        <div ref={gridRef} className="designer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDesigners.length === 0 ? (
            <div className="col-span-full text-center py-16 glass-card border border-slate-800 rounded-3xl bg-slate-900/95 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Registered Freelancers Listed Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  As new freelancers register and receive admin verification, they will appear here in real time!
                </p>
              </div>
            </div>
          ) : (
            filteredDesigners.map((designer) => (
            <div
              key={designer.id}
              className="designer-card rounded-3xl glass-card border border-slate-800/80 hover:border-indigo-500/50 transition-all hover:-translate-y-1.5 group flex flex-col justify-between overflow-hidden shadow-xl"
            >
              <div>
                {/* Cover Banner */}
                <div className="h-32 w-full relative overflow-hidden bg-slate-900">
                  <img src={designer.coverImage} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Badge */}
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                    ★ {designer.badge}
                  </span>
                </div>

                {/* Profile Header Info */}
                <div className="px-6 relative -mt-12 mb-4 flex items-end justify-between">
                  <div className="relative">
                    <img
                      src={designer.avatar}
                      alt={designer.name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-950 shadow-2xl"
                    />
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950" title="Online & Available" />
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-white font-mono">${designer.hourlyRate}</span>
                    <span className="text-xs text-slate-400 block font-mono">/ hour</span>
                  </div>
                </div>

                {/* Details */}
                <div className="px-6 mb-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                      {designer.name}
                    </h3>
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                  </div>

                  <p className="text-xs font-semibold text-slate-300 mb-2 leading-snug">
                    {designer.title}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mb-4">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      ★ {designer.rating} ({designer.reviewsCount})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {designer.location.split(' ')[0]}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {designer.bio}
                  </p>

                  {/* Specialty Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {designer.specialties.map((spec) => (
                      <span key={spec} className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Portfolio Thumbnails Mini Row */}
                  <div className="mb-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">RECENT SHIPS:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {designer.portfolioItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative group/thumb">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex items-center gap-2 border-t border-slate-800/60 mt-2">
                <button
                  onClick={() => toggleCompareDesigner(designer.id)}
                  className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                    compareDesignerIds.includes(designer.id)
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Compare Side-by-Side"
                >
                  <Scale className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => navigate(`/designers/${designer.id}`)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-100 bg-slate-900 hover:bg-slate-800 transition-colors border border-slate-800 flex items-center justify-center gap-1"
                >
                  <span>Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
        </div>

        {/* Floating Compare Bar */}
        {compareDesignerIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-xl border border-indigo-500/40 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
            <span className="text-xs font-mono text-cyan-300 font-bold">
              Comparing {compareDesignerIds.length} Freelancers
            </span>
            <button
              onClick={() => navigate('/compare')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Side-by-Side</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

