import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Star, CheckCircle, Users, Briefcase, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BackgroundVideo } from '../BackgroundVideo';
import { animate } from 'animejs/animation';
import { createTimeline } from 'animejs/timeline';
import { createScope } from 'animejs/scope';
import { onScroll } from 'animejs/events';

const MotionDiv = motion.div as any;
const Hero3DScene = lazy(() => import('../3d/Hero3DScene'));

import { useUser } from '../../context/UserContext';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, approvedFreelancers, dynamicJobs } = useUser();
  const topFreelancer = approvedFreelancers[0];
  const heroJob = dynamicJobs[0];
  const sectionRef = useRef<HTMLElement>(null);
  const matchPercentRef = useRef<HTMLSpanElement>(null);
  const matchRingRef = useRef<SVGCircleElement>(null);
  const headlineWords = ['Find', 'Elite', 'Freelancers', '&', 'Build', 'Your', 'Dream', 'Project'];

  useEffect(() => {
    const root = sectionRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const scope = createScope({
      root,
      mediaQueries: {
        mobile: '(orientation: portrait), (hover: none), (pointer: coarse)',
        desktop: '(hover: hover) and (pointer: fine)',
      },
    }).add(() => {
      createTimeline({ defaults: { ease: 'outExpo' } })
        .add('.hero-logo-mark', { opacity: [0, 1], scale: [0.72, 1], rotate: [-16, 0], duration: 650 })
        .add('.hero-word', { opacity: [0, 1], y: [28, 0], duration: 700, delay: (_target: unknown, i = 0) => i * 45 }, '-=260')
        .add('.hero-subtext', { opacity: [0, 1], y: [18, 0], duration: 620 }, '-=260')
        .add('.hero-cta', { opacity: [0, 1], scale: [0.84, 1], duration: 720, ease: 'outElastic(1, .65)', delay: (_target: unknown, i = 0) => i * 90 }, '-=220');

      const counter = { value: 0 };
      animate(counter, {
        value: [0, 98],
        duration: 1400,
        ease: 'outElastic(1, .75)',
        autoplay: onScroll({
          target: '.match-found-card',
          enter: 'bottom-=20 top',
        }),
        onUpdate: () => {
          const bounded = Math.min(98, Math.max(0, Math.round(counter.value)));
          if (matchPercentRef.current) matchPercentRef.current.textContent = `${bounded}%`;
          if (matchRingRef.current) matchRingRef.current.style.strokeDashoffset = `${100 - bounded}`;
        },
      });
    });

    return () => scope.revert();
  }, []);

  return (
    <section ref={sectionRef} data-section-theme="hero" className="relative min-h-screen pt-24 pb-16 overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-center">
      <BackgroundVideo />

      {/* Animated Orbs & 3D Scene */}
      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center opacity-30"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>}>
        <Hero3DScene />
      </Suspense>
      
      <MotionDiv 
        animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-tr from-indigo-600 to-transparent rounded-full blur-3xl opacity-30 mix-blend-screen pointer-events-none" 
      />
      <MotionDiv 
        animate={{ y: [0, 30, 0], x: [0, -20, 0], opacity: [0.1, 0.2, 0.1] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-bl from-purple-600 to-cyan-500 rounded-full blur-3xl opacity-20 mix-blend-screen pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <MotionDiv 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 shadow-sm w-fit">
              <Sparkles className="hero-logo-mark w-4 h-4 text-[#FF6B6B]" />
              <span className="text-sm font-medium text-gray-600">AI-Powered Freelance Matching</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
              <span className="inline-flex flex-wrap gap-x-3 gap-y-1">
                {headlineWords.slice(0, 4).map((word) => (
                  <span key={word} className="hero-word inline-block text-white">{word}</span>
                ))}
              </span>
              <br />
              <span className="inline-flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {headlineWords.slice(4).map((word) => (
                  <span key={word} className="hero-word inline-block text-cyan-300 font-extrabold drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]">
                    {word}
                  </span>
                ))}
              </span>
            </h1>
            
            <p className="hero-subtext text-lg text-slate-300 max-w-xl font-light">
              Connect with top-tier developers and designers. Our AI assistant summarizes your requirements, finds the perfect match, and our platform ensures 100% secure escrow payments.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={() => {
                  if (!isAuthenticated) navigate('/login');
                  else if (role === 'freelancer') alert('Client account required to post a project.');
                  else navigate('/brief');
                }}
                className="hero-cta group relative px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden flex items-center justify-center gap-2"
              >
                <span>Post a Project</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => navigate('/designers')}
                className="hero-cta px-8 py-4 bg-slate-900 text-slate-100 font-bold rounded-xl border border-slate-700 hover:border-cyan-400 hover:text-cyan-300 transition-colors shadow-sm text-center"
              >
                Find Talent
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-slate-300">100% Escrow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-300">4.98 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-medium text-slate-300">12K+ Projects</span>
              </div>
            </div>
            
            <div className="flex gap-8 mt-2">
              <div>
                <div className="text-2xl font-bold text-white">20K+</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Happy Clients</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">150+</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Countries</div>
              </div>
            </div>
          </MotionDiv>

          <MotionDiv 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative h-[600px] flex items-center justify-center perspective-[2000px]"
          >
            {/* 3D Floating Mockup */}
            <MotionDiv
              animate={{ rotateY: [-10, 10, -10], rotateX: [5, -5, 5], y: [-15, 15, -15] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-80 h-[28rem] preserve-3d"
            >
              {/* Main Card */}
              <div className="match-found-card absolute inset-0 bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col transform translate-z-[20px]">
                <div className="h-40 bg-gradient-to-br from-indigo-600/80 via-purple-600/80 to-cyan-500/80 p-6 relative">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10 flex items-center justify-between text-white">
                    <div className="font-bold text-lg">Project Scope</div>
                    <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded text-xs font-medium border border-white/20">AI Generated</div>
                  </div>
                  <div className="relative z-10 mt-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                    <div className="w-3/4 h-3 bg-white/40 rounded-full mb-2"></div>
                    <div className="w-1/2 h-3 bg-white/20 rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex-1 p-6 flex flex-col gap-4 bg-slate-950/40 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-white">Match Found</div>
                    <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full font-medium border border-emerald-500/20 flex items-center gap-2">
                      <svg className="h-7 w-7 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                        <circle cx="18" cy="18" r="15.5" stroke="rgba(148,163,184,.25)" strokeWidth="3" fill="none" />
                        <circle
                          ref={matchRingRef}
                          cx="18"
                          cy="18"
                          r="15.5"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          pathLength="100"
                          strokeDasharray="100"
                          strokeDashoffset="100"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span><span ref={matchPercentRef}>0%</span> Match</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30 shadow-md flex items-center gap-4">
                    <img
                      src={topFreelancer?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'}
                      alt={topFreelancer?.name || 'Elena Rostova'}
                      className="w-12 h-12 rounded-full ring-2 ring-cyan-400 object-cover"
                    />
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{topFreelancer?.name || 'Elena Rostova'}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          VETTED
                        </span>
                      </div>
                      <div className="text-xs text-cyan-300 font-medium">{topFreelancer?.title || 'Senior Full Stack & AI Specialist'}</div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-300 font-bold uppercase font-mono">Milestone 1 Escrow</div>
                      <div className="font-extrabold text-emerald-400 text-lg font-mono">
                        ${(heroJob?.maxBudget ? Math.round(heroJob.maxBudget * 0.4) : 1200).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/wallet')}
                      className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs px-4 py-2 rounded-xl font-extrabold shadow-md hover:scale-105 transition-all"
                    >
                      Fund Escrow
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge 1 */}
              <MotionDiv 
                animate={{ z: [40, 70, 40], y: [10, -10, 10], x: [20, 30, 20] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-12 top-16 bg-slate-900/60 backdrop-blur-xl rounded-xl shadow-xl shadow-cyan-500/10 border border-white/10 p-3 flex gap-3 items-center transform translate-z-[60px]"
              >
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Smart Contract</div>
                  <div className="text-[10px] text-slate-400">Funds secured</div>
                </div>
              </MotionDiv>
              
              {/* Floating Badge 2 */}
              <MotionDiv 
                animate={{ z: [60, 30, 60], y: [-15, 15, -15], x: [-20, -10, -20] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -left-10 bottom-24 bg-slate-900/60 backdrop-blur-xl rounded-xl shadow-xl shadow-purple-500/10 border border-white/10 p-3 flex gap-3 items-center transform translate-z-[80px]"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Collaboration</div>
                  <div className="text-[10px] text-slate-400">Live chat active</div>
                </div>
              </MotionDiv>
            </MotionDiv>
          </MotionDiv>

        </div>
      </div>
    </section>
  );
};
