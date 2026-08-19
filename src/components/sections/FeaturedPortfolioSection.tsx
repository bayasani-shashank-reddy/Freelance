import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ExternalLink, ArrowLeft, ArrowRight, Eye, Heart, Layers, Sparkles } from 'lucide-react';
import { MOCK_PORTFOLIO_ITEMS } from '../../data/mockData';

const MotionDiv = motion.div as any;

export const FeaturedPortfolioSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const items = MOCK_PORTFOLIO_ITEMS;
  const active = items[activeIndex];

  // Autoplay rotation
  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % items.length);
    }, 4000);
    return () => clearInterval(id);
  }, [autoplay, items.length]);

  // 3D parallax on mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => setMousePos({ x: 0, y: 0 });

  const prev = () => { setAutoplay(false); setActiveIndex((i) => (i - 1 + items.length) % items.length); };
  const next = () => { setAutoplay(false); setActiveIndex((i) => (i + 1) % items.length); };

  return (
    <section ref={sectionRef} className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[300px] bg-indigo-600/6 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Portfolio Showcase</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Work That <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">Defines Excellence</span>
          </h2>
          <p className="text-slate-400 mt-3 text-lg max-w-xl mx-auto">
            Explore industry-leading projects delivered by our top freelancers.
          </p>
        </MotionDiv>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* 3D Card */}
          <MotionDiv
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
            style={{ perspective: '1200px' }}
          >
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative cursor-pointer"
              style={{
                transform: `rotateY(${mousePos.x * 8}deg) rotateX(${-mousePos.y * 6}deg)`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.15s ease-out',
              }}
            >
              <AnimatePresence mode="wait">
                <MotionDiv
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.94, rotateY: 15 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.94, rotateY: -15 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl shadow-black/60"
                >
                  <img
                    src={active.image}
                    alt={active.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Color palette */}
                  <div className="absolute top-4 right-4 flex gap-1.5">
                    {active.colorPalette.map((c) => (
                      <div key={c} className="w-5 h-5 rounded-full ring-2 ring-white/20" style={{ background: c }} />
                    ))}
                  </div>

                  {/* Bottom info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-3 inline-block">
                      {active.category}
                    </span>
                    <h3 className="text-xl font-black text-white mt-2 leading-tight">{active.title}</h3>
                    <p className="text-sm text-slate-300 mt-1 line-clamp-2">{active.description}</p>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Heart className="w-3.5 h-3.5 text-pink-400" />
                        <span>{active.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{active.views.toLocaleString()}</span>
                      </div>
                      <a
                        href={active.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold hover:bg-white/20 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Live
                      </a>
                    </div>
                  </div>
                </MotionDiv>
              </AnimatePresence>

              {/* 3D floating layer effect */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  transform: `translateZ(-20px) translateX(${mousePos.x * 8}px) translateY(${mousePos.y * 8}px)`,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(236,72,153,0.3))',
                  filter: 'blur(20px)',
                  transition: 'transform 0.15s ease-out',
                }}
              />
            </div>

            {/* Nav buttons */}
            <div className="flex items-center gap-3 justify-center mt-6">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-500 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Dots */}
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setAutoplay(false); setActiveIndex(i); }}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? 'w-8 h-2 bg-indigo-400'
                      : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}

              <button
                onClick={next}
                className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-indigo-500 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </MotionDiv>

          {/* Right — Project details & Thumbnail strip */}
          <MotionDiv
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="flex flex-col gap-6"
          >
            {/* Metrics highlight */}
            <AnimatePresence mode="wait">
              <MotionDiv
                key={activeIndex + '-info'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/8 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-widest">Project Impact</span>
                  </div>
                  <h3 className="text-2xl font-black text-white leading-tight">{active.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{active.description}</p>
                  
                  <div className="p-4 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl">
                    <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest mb-1">Client Outcome</div>
                    <div className="text-sm font-bold text-white">{active.metrics}</div>
                    <div className="text-xs text-slate-400 mt-0.5">— {active.clientName}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {active.tags.map((tag) => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </MotionDiv>
            </AnimatePresence>

            {/* Thumbnail strip */}
            <div className="grid grid-cols-3 gap-3">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => { setAutoplay(false); setActiveIndex(i); }}
                  className={`relative aspect-video rounded-xl overflow-hidden transition-all duration-300 ${
                    i === activeIndex
                      ? 'ring-2 ring-indigo-500 scale-105 shadow-lg shadow-indigo-500/20'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  <div className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate">{item.category}</div>
                </button>
              ))}
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
};
