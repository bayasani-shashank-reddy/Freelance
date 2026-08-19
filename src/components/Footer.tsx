import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { FoundersSection } from './sections/FoundersSection';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-8 pb-8">
      {/* Global Founders Section at Bottom of All Pages */}
      <FoundersSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group w-max">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <span className="text-xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                NEXUS<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">CRAFT</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              The premium marketplace connecting visionary clients with top-tier creative talent. Build the future, beautifully.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-indigo-400 border border-slate-800 shadow-sm transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-cyan-400 border border-slate-800 shadow-sm transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-slate-100 tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/designers" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Find Talent</Link></li>
              <li><Link to="/jobs" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Find Work</Link></li>
              <li><Link to="/brief" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Post a Project</Link></li>
              <li><Link to="/help" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">How It Works</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-slate-100 tracking-wider uppercase mb-4">Company & Support</h3>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">About NexusCraft</Link></li>
              <li><Link to="/help" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Careers</Link></li>
              <li><Link to="/help" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Blog</Link></li>
              <li><Link to="/help" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Contact & Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-100 tracking-wider uppercase mb-4">Stay Updated</h3>
            <p className="text-xs text-slate-400 mb-4">Get the latest platform updates directly in your inbox.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-l-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
              />
              <button 
                type="submit" 
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-sm rounded-r-lg transition-colors font-medium border border-slate-700"
              >
                Subscribe
              </button>
            </form>
            <div className="mt-6 flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-500">TRUSTED BY</span>
              <div className="flex space-x-2">
                <div className="w-12 h-4 bg-slate-800/80 rounded animate-pulse"></div>
                <div className="w-12 h-4 bg-slate-800/80 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <div>
            <p>&copy; {new Date().getFullYear()} NexusCraft Inc. All rights reserved.</p>
            <p className="text-[11px] text-cyan-400/90 font-mono mt-1">
              Founders: <strong className="text-white">B. Shashank Reddy</strong> (CEO) • <strong className="text-white">D. Aashritha</strong> (CPO) • <strong className="text-white">G. Vipul</strong> (CTO)
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="https://www.linkedin.com/in/bayasani-shashank-reddy-0229583bb/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors font-mono">B. Shashank Reddy (LinkedIn)</a>
            <a href="https://github.com/bayasani-shashank-reddy" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-purple-400 transition-colors font-mono">B. Shashank Reddy (GitHub)</a>
            <a href="https://www.linkedin.com/in/aashritha-dhannarapu-965b49339/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors font-mono">D. Aashritha (LinkedIn)</a>
            <a href="https://github.com/dhannarapu-aashritha" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-purple-400 transition-colors font-mono">D. Aashritha (GitHub)</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
