import React, { useEffect, useState, useRef } from 'react';
import type { PortfolioItem } from '../../types';
import { MOCK_PORTFOLIO_ITEMS } from '../../data/mockData';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Eye, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { animate } from 'animejs/animation';
import { createScope } from 'animejs/scope';
import { createDraggable } from 'animejs/draggable';
import { createSpring } from 'animejs/easings/spring';
import { morphTo } from 'animejs/svg';

export const HowItWorksSection: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'SaaS', 'Mobile App', 'Fintech', 'AI Studio', 'E-commerce', 'Design System'];

  const filteredItems = selectedCategory === 'All'
    ? MOCK_PORTFOLIO_ITEMS
    : MOCK_PORTFOLIO_ITEMS.filter(item => item.category === selectedCategory);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const steps = [
    {
      number: '01',
      iconPath: 'M8 7h8a2 2 0 0 1 2 2v1H6V9a2 2 0 0 1 2-2ZM6 10h12v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-5ZM9 4v3M15 4v3M9 17v3M15 17v3',
      morphPath: 'M5 12l4 4L19 6',
      title: 'AI Brief Generation',
      description: 'Answer 4 quick questions or paste your project specs. Our AI structures a complete design brief with milestones and tech stack.'
    },
    {
      number: '02',
      iconPath: 'M12 4 4 8l8 4 8-4-8-4ZM4 12l8 4 8-4M4 16l8 4 8-4',
      morphPath: 'M4 12h16M12 4v16M7 7l10 10M17 7 7 17',
      title: 'Curated 1% Match',
      description: 'In under 60 seconds, receive proposals from top 3 verified designers specializing in your exact industry & visual style.'
    },
    {
      number: '03',
      iconPath: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9ZM12 15v2',
      morphPath: 'M6 12h12M8 12V8a4 4 0 0 1 7.2-2.4M18 12v8H6v-8',
      title: 'Milestone Escrow',
      description: 'Fund milestones safely into smart escrow. Payouts are only released when you inspect and approve deliverables.'
    },
    {
      number: '04',
      iconPath: 'M5 12l4 4L19 6M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
      morphPath: 'M4 12h6l2-7 2 14 2-7h4M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
      title: 'Production Hand-off',
      description: 'Receive production-ready Figma tokens, Framer interactive code, or React components with full IP transfer.'
    }
  ];

  const testimonials = [
    ['Maya Chen', 'Founder, PrismOps', 'The brief builder compressed a week of agency calls into one focused hour. The match felt oddly precise in the best way.'],
    ['Arjun Rao', 'Product Lead, Vaultly', 'We dragged three directions around in review and still shipped faster than our old RFP process.'],
    ['Elena Brooks', 'COO, Northstar Labs', 'Escrow plus vetted designers made the whole thing feel controlled without becoming slow.'],
  ];

  useEffect(() => {
    const root = sectionRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const scope = createScope({
      root,
      mediaQueries: {
        mobile: '(orientation: portrait), (hover: none), (pointer: coarse)',
        desktop: '(hover: hover) and (pointer: fine)',
      },
    }).add((self) => {
      const cleanups: Array<() => void> = [];

      root.querySelectorAll<SVGPathElement>('.step-icon-path').forEach((path) => {
        const original = path.getAttribute('d') ?? '';
        const target = path.parentElement?.querySelector<SVGPathElement>('.step-icon-target');
        if (!target) return;

        const enter = () => animate(path, { d: morphTo(target), duration: 420, ease: 'inOut(3)' });
        const leave = () => animate(path, { d: original, duration: 420, ease: 'inOut(3)' });
        path.closest('.workflow-step')?.addEventListener('mouseenter', enter);
        path.closest('.workflow-step')?.addEventListener('mouseleave', leave);

        cleanups.push(() => {
          path.closest('.workflow-step')?.removeEventListener('mouseenter', enter);
          path.closest('.workflow-step')?.removeEventListener('mouseleave', leave);
        });
      });

      if (!self?.matches.mobile) {
        root.querySelectorAll('.testimonial-card').forEach((card) => {
          createDraggable(card, {
            x: true,
            y: false,
            snap: [0],
            releaseEase: createSpring({ stiffness: 120, damping: 12 }),
          });
        });
      }

      return () => cleanups.forEach((cleanup) => cleanup());
    });

    return () => scope.revert();
  }, []);

  return (
    <section ref={sectionRef} data-section-theme="workflow" className="py-24 bg-slate-950 relative overflow-hidden text-slate-200">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Seamless 4-Step Marketplace Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            How <span className="gradient-text">NexusCraft</span> Delivers Excellence
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Eliminate endless agency calls and unreliable freelancer platforms. Get matched with elite product designers backed by escrow security.
          </p>
        </div>

        {/* 4-Step Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {steps.map((step) => (
              <div
                key={step.number}
                className="workflow-step p-6 rounded-2xl glass-card border border-slate-800/80 hover:border-indigo-500/40 transition-all hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                    STEP {step.number}
                  </span>
                  <div className="p-2.5 rounded-xl bg-slate-900 text-indigo-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all border border-slate-800">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path className="step-icon-path" d={step.iconPath} />
                      <path className="step-icon-target hidden" d={step.morphPath} />
                    </svg>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
          ))}
        </div>

        {/* Horizontal Scroll Showcase Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-3">
              <span>EXPLORE RECENT SHIPS</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Horizontal Portfolio Showcase
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Drag or scroll through past design deliverables created by our top designers.
            </p>
          </div>

          {/* Navigation Scroll Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleScroll('left')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-6 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/25 font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Horizontal Drag & Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto no-scrollbar pb-8 pt-2 scroll-smooth"
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveModalItem(item)}
              className="w-[340px] sm:w-[400px] shrink-0 rounded-2xl glass-card border border-slate-800/80 hover:border-indigo-500/50 transition-all hover:-translate-y-1.5 cursor-pointer group overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image Container */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                    {item.category}
                  </span>

                  {/* Metrics Badge */}
                  <span className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-indigo-950/90 backdrop-blur-md text-emerald-300 border border-emerald-500/30 truncate">
                    ⚡ {item.metrics}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h4 className="font-bold text-white text-base mb-2 group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>{item.likes}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{item.views}</span>
                  </span>
                </div>
                <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Case Study <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div data-section-theme="testimonials" className="mt-16">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30 mb-3">
              <span>CLIENT SIGNAL</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Proof That Moves With You
            </h3>
          </div>
          <div className="testimonial-carousel flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4">
            {testimonials.map(([name, role, quote]) => (
              <article
                key={name}
                className="testimonial-card snap-center w-[82vw] sm:w-[360px] shrink-0 rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20 touch-pan-x cursor-grab active:cursor-grabbing"
              >
                <p className="text-sm text-slate-300 leading-relaxed mb-5">{quote}</p>
                <div className="border-t border-slate-800 pt-4">
                  <div className="font-bold text-white text-sm">{name}</div>
                  <div className="text-xs text-fuchsia-300 font-mono">{role}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Item Detail Lightbox Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl glass-card-glow border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
            >
              ✕
            </button>

            {/* Modal Image */}
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden mb-6 bg-slate-900">
              <img
                src={activeModalItem.image}
                alt={activeModalItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70" />
              <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-slate-950/80 text-cyan-300 border border-cyan-500/40">
                {activeModalItem.category}
              </span>
            </div>

            {/* Modal Body */}
            <h3 className="text-2xl font-extrabold text-white mb-2">
              {activeModalItem.title}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {activeModalItem.description}
            </p>

            {/* Color Palette Swatches */}
            <div className="mb-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Brand Palette Tokens:
              </span>
              <div className="flex items-center gap-3">
                {activeModalItem.colorPalette.map((hex) => (
                  <div key={hex} className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: hex }} />
                    <span className="text-xs font-mono text-slate-300">{hex}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics & Client Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                <span className="text-xs text-indigo-300 block font-mono mb-1">CLIENT IMPACT METRICS</span>
                <span className="text-sm font-bold text-white">{activeModalItem.metrics}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 block font-mono mb-1">CLIENT NAME</span>
                <span className="text-sm font-bold text-white">{activeModalItem.clientName}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => {
                  setActiveModalItem(null);
                  navigate('/designers');
                }}
                className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Hire Designer for Similar Project</span>
              </button>

              <button
                onClick={() => setActiveModalItem(null)}
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
