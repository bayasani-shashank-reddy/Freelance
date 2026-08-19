import React from 'react';
import { User, Sparkles } from 'lucide-react';

interface Founder {
  name: string;
  role: string;
  initials: string;
  linkedin: string;
  github: string;
}

const FOUNDERS: Founder[] = [
  {
    name: 'B. SHASHANK REDDY',
    role: 'FOUNDER & CEO',
    initials: 'SR',
    linkedin: 'https://www.linkedin.com/in/bayasani-shashank-reddy-0229583bb/',
    github: 'https://github.com/bayasani-shashank-reddy',
  },
  {
    name: 'D. AASHRITHA',
    role: 'FOUNDER & CPO',
    initials: 'DA',
    linkedin: 'https://www.linkedin.com/in/aashritha-dhannarapu-965b49339/',
    github: 'https://github.com/dhannarapu-aashritha',
  },
  {
    name: 'G. VIPUL',
    role: 'FOUNDER & CTO',
    initials: 'GV',
    linkedin: 'https://www.linkedin.com/in/g-vipul/',
    github: 'https://github.com/g-vipul',
  },
];

export const FoundersSection: React.FC = () => {
  return (
    <section className="py-8 sm:py-10 bg-slate-950 text-slate-100 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="uppercase tracking-widest font-bold">NEXUSCRAFT FOUNDERS</span>
          </div>
        </div>

        {/* Compact Founders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {FOUNDERS.map((founder) => (
            <div key={founder.name} className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all duration-300">
              {/* Empty Small Round Avatar */}
              <div className="w-14 h-14 rounded-full bg-slate-950 border-2 border-slate-800 text-amber-400 flex items-center justify-center mb-3 shadow-md group-hover:border-amber-400">
                <User className="w-6 h-6 text-amber-400/80" />
              </div>

              {/* Bold Uppercase Name */}
              <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase mb-0.5">
                {founder.name}
              </h3>

              <div className="text-[11px] font-mono text-amber-400 font-semibold tracking-wider uppercase mb-3">
                {founder.role}
              </div>

              {/* Gold Social Icons */}
              <div className="flex items-center justify-center gap-3">
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-950 border border-amber-500/40 hover:bg-amber-400 hover:text-slate-950 text-amber-400 flex items-center justify-center transition-all shadow-sm"
                  title={`${founder.name} LinkedIn`}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>

                <a
                  href={founder.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-950 border border-amber-500/40 hover:bg-amber-400 hover:text-slate-950 text-amber-400 flex items-center justify-center transition-all shadow-sm"
                  title={`${founder.name} GitHub`}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FoundersSection;
