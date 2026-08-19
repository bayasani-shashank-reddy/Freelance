import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Briefcase, Globe2, DollarSign, Star, Zap } from 'lucide-react';

const MotionDiv = motion.div as any;

interface StatItem {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  sublabel: string;
  color: string;
  glow: string;
}

const STATS: StatItem[] = [
  {
    icon: <Users className="w-6 h-6" />,
    value: 20,
    suffix: 'K+',
    label: 'Happy Clients',
    sublabel: 'Across 150+ countries',
    color: 'text-cyan-400',
    glow: 'shadow-cyan-500/20',
  },
  {
    icon: <Briefcase className="w-6 h-6" />,
    value: 98,
    suffix: 'K+',
    label: 'Projects Completed',
    sublabel: '98.2% success rate',
    color: 'text-indigo-400',
    glow: 'shadow-indigo-500/20',
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    value: 4.85,
    suffix: 'M+',
    prefix: '$',
    label: 'Total GMV',
    sublabel: 'Secured via escrow',
    color: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
  },
  {
    icon: <Globe2 className="w-6 h-6" />,
    value: 150,
    suffix: '+',
    label: 'Countries Served',
    sublabel: 'Truly global talent',
    color: 'text-purple-400',
    glow: 'shadow-purple-500/20',
  },
  {
    icon: <Star className="w-6 h-6" />,
    value: 4.98,
    suffix: '/5',
    label: 'Avg. Platform Rating',
    sublabel: 'Based on 40K+ reviews',
    color: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    value: 9,
    suffix: 'K+',
    label: 'Expert Freelancers',
    sublabel: 'Vetted & ready to hire',
    color: 'text-pink-400',
    glow: 'shadow-pink-500/20',
  },
];

const useCountUp = (target: number, duration = 2000, isActive: boolean) => {
  const [count, setCount] = useState(0);
  const isDecimal = target % 1 !== 0;

  useEffect(() => {
    if (!isActive) return;
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + eased * (target - start);
      setCount(isDecimal ? Math.round(current * 100) / 100 : Math.round(current));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, isActive, isDecimal]);

  return count;
};

const StatCard: React.FC<{ stat: StatItem; index: number; isActive: boolean }> = ({ stat, index, isActive }) => {
  const count = useCountUp(stat.value, 1800 + index * 150, isActive);
  const isDecimal = stat.value % 1 !== 0;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 40 }}
      animate={isActive ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`relative group bg-slate-900/60 backdrop-blur-xl border border-white/8 rounded-3xl p-6 hover:border-white/15 transition-all duration-500 shadow-xl ${stat.glow} hover:shadow-2xl overflow-hidden`}
    >
      {/* Glow background */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent via-transparent pointer-events-none`} />
      
      {/* Icon */}
      <div className={`w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
        {stat.icon}
      </div>

      {/* Value */}
      <div className={`text-4xl font-black font-mono ${stat.color} tracking-tight`}>
        {stat.prefix}{isDecimal ? count.toFixed(2) : count.toLocaleString()}{stat.suffix}
      </div>

      {/* Label */}
      <div className="text-base font-bold text-white mt-1">{stat.label}</div>
      <div className="text-xs text-slate-500 mt-0.5 font-medium">{stat.sublabel}</div>

      {/* Decorative line */}
      <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-700 bg-gradient-to-r from-transparent via-current to-transparent ${stat.color}`} />
    </MotionDiv>
  );
};

export const StatsCounterSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Platform Metrics — Live</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Numbers That <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">Speak for Themselves</span>
          </h2>
          <p className="text-slate-400 mt-3 text-lg max-w-xl mx-auto">
            A platform trusted by startups, enterprises, and elite freelancers worldwide.
          </p>
        </MotionDiv>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} isActive={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};
