import React from 'react';
import { useUser } from '../context/UserContext';
import { BarChart3, TrendingUp } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { role, user, dynamicJobs, dynamicProposals } = useUser();
  const isFreelancer = role === 'freelancer';

  const myWonProposals = dynamicProposals.filter(p => p.freelancerId === user?.id && p.status === 'Accepted');
  const myTotalProposals = dynamicProposals.filter(p => p.freelancerId === user?.id);
  const myTotalEarnings = myWonProposals.reduce((sum, p) => sum + p.proposedBudget, 0);
  const myWinRate = myTotalProposals.length ? Math.round((myWonProposals.length / myTotalProposals.length) * 100) : 0;

  const myPostedJobs = dynamicJobs.filter(j => j.clientId === user?.id);
  const myTotalSpend = myPostedJobs.reduce((sum, j) => sum + (j.assignedFreelancerId ? j.maxBudget : 0), 0);
  const myHiredFreelancers = myPostedJobs.filter(j => !!j.assignedFreelancerId).length;

  const freelancerData = {
    totalEarnings: myTotalEarnings,
    jobSuccessRate: myWinRate,
    profileViewsThisMonth: 0,
    proposalConversionRate: myWinRate,
    monthlyEarningsHistory: [
      { month: 'Jan', amount: 0 }, { month: 'Feb', amount: 0 }, { month: 'Mar', amount: 0 },
      { month: 'Apr', amount: 0 }, { month: 'May', amount: 0 }, { month: 'Jun', amount: myTotalEarnings },
    ],
  };

  const clientData = {
    totalSpend: myTotalSpend,
    projectCompletionRate: myHiredFreelancers > 0 ? 100 : 0,
    freelancersHired: myHiredFreelancers,
    projectsPosted: myPostedJobs.length,
    monthlySpendHistory: [
      { month: 'Jan', amount: 0 }, { month: 'Feb', amount: 0 }, { month: 'Mar', amount: 0 },
      { month: 'Apr', amount: 0 }, { month: 'May', amount: 0 }, { month: 'Jun', amount: myTotalSpend },
    ],
  };

  const history = isFreelancer ? freelancerData.monthlyEarningsHistory : clientData.monthlySpendHistory;
  const maxVal = Math.max(...history.map((h) => h.amount)) || 1000;

  return (
    <div className="pt-28 pb-24 bg-slate-950 min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
              {isFreelancer ? 'FREELANCER EARNINGS & PROPOSAL ANALYTICS' : 'CLIENT SPEND & PROCUREMENT ANALYTICS'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Performance Analytics</h1>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card border border-slate-800 p-6 rounded-3xl">
            <div className="text-xs font-mono text-slate-500 mb-1">{isFreelancer ? 'TOTAL EARNINGS' : 'TOTAL SPEND'}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              ${(isFreelancer ? freelancerData.totalEarnings : clientData.totalSpend).toLocaleString()}
            </div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl">
            <div className="text-xs font-mono text-slate-500 mb-1">PROJECT COMPLETION RATE</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">
              {isFreelancer ? freelancerData.jobSuccessRate : clientData.projectCompletionRate}%
            </div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl">
            <div className="text-xs font-mono text-slate-500 mb-1">{isFreelancer ? 'PROFILE VIEWS (MONTH)' : 'FREELANCERS HIRED'}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 font-mono">
              {isFreelancer ? freelancerData.profileViewsThisMonth : clientData.freelancersHired}
            </div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl">
            <div className="text-xs font-mono text-slate-500 mb-1">{isFreelancer ? 'PROPOSAL WIN RATE' : 'PROJECTS POSTED'}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">
              {isFreelancer ? `${freelancerData.proposalConversionRate}%` : clientData.projectsPosted}
            </div>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="glass-card border border-slate-800/80 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>{isFreelancer ? 'Monthly Revenue Growth ($ USD)' : 'Monthly Spend Breakdown ($ USD)'}</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">6-Month Trend</span>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-8 pb-4 px-4 bg-slate-950 rounded-2xl border border-slate-800">
            {history.map((item) => {
              const heightPercent = Math.round((item.amount / maxVal) * 100);
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-mono text-cyan-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    ${item.amount.toLocaleString()}
                  </div>
                  <div
                    className="w-full max-w-[48px] bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-xl transition-all duration-500 group-hover:brightness-125"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-mono text-slate-400">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
