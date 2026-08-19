import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Trophy, Star, TrendingUp, Award, Crown, Medal, Zap } from 'lucide-react';

const MotionDiv = motion.div as any;

interface LeaderEntry {
  rank: number;
  name: string;
  title: string;
  avatar: string;
  earnings: number;
  rating: number;
  projects: number;
  badge: string;
  badgeColor: string;
  specialty: string;
  trend: number[]; // sparkline data
}

const LEADERS: LeaderEntry[] = [
  {
    rank: 1,
    name: 'Elena Rostova',
    title: 'Staff Product Designer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    earnings: 84500,
    rating: 4.99,
    projects: 68,
    badge: 'Top 1%',
    badgeColor: 'from-yellow-400 to-amber-500',
    specialty: 'SaaS & 3D UI',
    trend: [30, 55, 48, 72, 80, 95, 88, 100],
  },
  {
    rank: 2,
    name: 'Julian Vance',
    title: 'Principal Mobile Architect',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    earnings: 72200,
    rating: 4.98,
    projects: 52,
    badge: 'Pro Elite',
    badgeColor: 'from-slate-300 to-slate-400',
    specialty: 'iOS & Fintech',
    trend: [60, 50, 75, 65, 88, 78, 92, 95],
  },
  {
    rank: 3,
    name: 'Liam O\'Connor',
    title: 'Design System Architect',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    earnings: 68900,
    rating: 5.0,
    projects: 82,
    badge: 'Master',
    badgeColor: 'from-orange-400 to-amber-600',
    specialty: 'Design Tokens',
    trend: [40, 60, 55, 80, 75, 90, 88, 98],
  },
  {
    rank: 4,
    name: 'Maya Tanaka',
    title: 'Web3 Visual Director',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    earnings: 54100,
    rating: 4.96,
    projects: 45,
    badge: 'Rising Star',
    badgeColor: 'from-purple-400 to-pink-500',
    specialty: 'DeFi & Cyberpunk',
    trend: [20, 35, 45, 60, 55, 70, 80, 88],
  },
  {
    rank: 5,
    name: 'Kai Nakamura',
    title: 'Full Stack AI Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    earnings: 49800,
    rating: 4.97,
    projects: 39,
    badge: 'Top 5%',
    badgeColor: 'from-cyan-400 to-blue-500',
    specialty: 'React & AI',
    trend: [25, 40, 50, 45, 65, 72, 78, 85],
  },
];

const RANK_ICONS = [
  <Crown key="1" className="w-4 h-4 text-yellow-400" />,
  <Medal key="2" className="w-4 h-4 text-slate-400" />,
  <Award key="3" className="w-4 h-4 text-amber-600" />,
];

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 60;
  const h = 24;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      {(() => {
        const last = data[data.length - 1];
        const x = w;
        const y = h - ((last - min) / range) * h;
        return <circle cx={x} cy={y} r="2.5" fill={color} />;
      })()}
    </svg>
  );
};

export const LeaderboardSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left — Header */}
          <MotionDiv
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="lg:sticky lg:top-32"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-mono font-bold uppercase tracking-widest mb-6">
              <Trophy className="w-3.5 h-3.5" />
              <span>Top Earners — August 2026</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              This Month's
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400">
                Elite Leaderboard
              </span>
            </h2>
            <p className="text-slate-400 mt-4 text-lg leading-relaxed max-w-md">
              Our top-performing freelancers ranked by earnings, project success rate, and client satisfaction.
            </p>

            {/* Total payout card */}
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 p-6 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 rounded-3xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <span className="text-xs font-mono font-bold text-yellow-300 uppercase tracking-widest">Total Platform Payouts — Aug</span>
              </div>
              <div className="text-4xl font-black text-white font-mono">$329,500</div>
              <div className="text-sm text-slate-400 mt-1">+18.4% vs last month</div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {LEADERS.slice(0, 4).map((l) => (
                    <img key={l.rank} src={l.avatar} alt={l.name} className="w-8 h-8 rounded-full ring-2 ring-slate-900 object-cover" />
                  ))}
                </div>
                <span className="text-xs text-slate-400">+{LEADERS.length} more elite earners this month</span>
              </div>
            </MotionDiv>
          </MotionDiv>

          {/* Right — Leaderboard List */}
          <div className="space-y-3">
            {LEADERS.map((leader, i) => (
              <MotionDiv
                key={leader.rank}
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative bg-slate-900/70 backdrop-blur-xl border border-white/8 rounded-2xl p-4 hover:border-white/15 transition-all duration-300 hover:shadow-xl cursor-pointer overflow-hidden"
              >
                {/* Rank 1 glow effect */}
                {leader.rank === 1 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent pointer-events-none rounded-2xl" />
                )}
                
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 text-center">
                    {i < 3 ? (
                      <div className="flex justify-center">{RANK_ICONS[i]}</div>
                    ) : (
                      <span className="text-sm font-black text-slate-500">#{leader.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={leader.avatar}
                      alt={leader.name}
                      className="w-11 h-11 rounded-full ring-2 ring-slate-700 object-cover"
                    />
                    {leader.rank === 1 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                        <Crown className="w-2.5 h-2.5 text-yellow-900" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">{leader.name}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${leader.badgeColor} text-slate-900 flex-shrink-0`}>
                        {leader.badge}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate">{leader.specialty}</div>
                  </div>

                  {/* Sparkline */}
                  <div className="flex-shrink-0 hidden sm:block">
                    <Sparkline data={leader.trend} color={leader.rank === 1 ? '#facc15' : '#6366f1'} />
                  </div>

                  {/* Earnings */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-black text-emerald-400 font-mono">
                      ${leader.earnings.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-[10px] text-slate-400">{leader.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom hover bar */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
              </MotionDiv>
            ))}

            {/* CTA */}
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-center pt-2"
            >
              <a
                href="/designers"
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Zap className="w-4 h-4" />
                View All Top Freelancers →
              </a>
            </MotionDiv>
          </div>
        </div>
      </div>
    </section>
  );
};
