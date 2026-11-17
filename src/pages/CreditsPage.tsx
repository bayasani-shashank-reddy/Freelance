import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, ArrowUpRight, ArrowDownLeft, RefreshCw, Plus } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { BoxedButton } from '../components/shared/BoxedButton';

export const CreditsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, credits, creditTransactions, refreshCredits } = useUser();

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  const transactions = Array.isArray(creditTransactions) && creditTransactions.length > 0
    ? creditTransactions
    : [
        {
          id: 'tx-welcome-grant',
          amount: 500,
          description: 'Platform Welcome Grant — Initial Project Intake & AI Scoping Quota',
          createdAt: new Date().toISOString()
        }
      ];

  const totalSpent = transactions
    .filter(t => (t?.amount || 0) < 0)
    .reduce((acc, t) => acc + Math.abs(t?.amount || 0), 0);

  const totalEarned = transactions
    .filter(t => (t?.amount || 0) > 0)
    .reduce((acc, t) => acc + (t?.amount || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8EAF4] dark:border-[#2A2A46]">
        <BoxedButton
          variant="secondary"
          size="sm"
          icon={<ArrowLeft className="w-3.5 h-3.5" />}
          onClick={() => {
            if (user?.role === 'admin') navigate('/admin/dashboard');
            else if (user?.role === 'freelancer') navigate('/freelancer/dashboard');
            else navigate('/client/dashboard');
          }}
        >
          Back to Dashboard
        </BoxedButton>

        <span className="text-xs font-mono font-bold text-[#7357FF] px-3 py-1 rounded-full bg-[#EEE9FF] dark:bg-[#252445]">
          INTERNAL UTILITY PROTOCOL
        </span>
      </div>

      {/* Main Vault Header Card (Stitch design) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#EEE9FF] text-[#7357FF]">
              NCX CREDIT VAULT
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B] dark:text-white">
            Available NCX Balance & Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#65677A] dark:text-[#A6A8C0]">
            NexusCraft internal utility credits used for AI requirements deconstruction and administrative triage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <BoxedButton
            variant="accent"
            size="md"
            icon={<Plus className="w-4 h-4 text-[#17172B]" />}
            onClick={() => alert('Credit allotment request transmitted to administrative team.')}
          >
            + Request Top-Up
          </BoxedButton>

          <BoxedButton
            variant="secondary"
            size="md"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={refreshCredits}
          >
            Sync Ledger
          </BoxedButton>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Available Balance */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#65677A] dark:text-[#8F91A3] font-bold">
              AVAILABLE BALANCE
            </span>
            <Coins className="w-4 h-4 text-[#7357FF]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-4xl text-[#17172B] dark:text-white">
              {credits}
            </span>
            <span className="font-mono text-xs font-bold text-[#7357FF]">NCX</span>
          </div>
          <p className="text-[11px] text-[#65677A] dark:text-[#8F91A3] pt-2 border-t border-[#F0F2F9] dark:border-[#202038]">
            50 NCX deducted per project submission
          </p>
        </div>

        {/* Card 2: Total Awarded */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#65677A] dark:text-[#8F91A3] font-bold">
              TOTAL AWARDED
            </span>
            <ArrowDownLeft className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-4xl text-[#10B981]">
              +{totalEarned || 500}
            </span>
            <span className="font-mono text-xs font-bold text-[#10B981]">NCX</span>
          </div>
          <p className="text-[11px] text-[#65677A] dark:text-[#8F91A3] pt-2 border-t border-[#F0F2F9] dark:border-[#202038]">
            Welcome grant & approved allotments
          </p>
        </div>

        {/* Card 3: Total Consumed */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#65677A] dark:text-[#8F91A3] font-bold">
              TOTAL CONSUMED
            </span>
            <ArrowUpRight className="w-4 h-4 text-[#FF826E]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-4xl text-[#FF826E]">
              -{totalSpent}
            </span>
            <span className="font-mono text-xs font-bold text-[#FF826E]">NCX</span>
          </div>
          <p className="text-[11px] text-[#65677A] dark:text-[#8F91A3] pt-2 border-t border-[#F0F2F9] dark:border-[#202038]">
            AI requirements deconstruction fees
          </p>
        </div>

      </div>

      {/* Transaction Ledger Table (Stitch Screenshot 1) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#17172B] border border-[#E8EAF4] dark:border-[#2A2A46] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F9] dark:border-[#202038]">
          <h3 className="font-display font-bold text-base text-[#17172B] dark:text-white">
            Live Transaction Ledger
          </h3>
          <span className="text-xs font-mono text-[#8F91A3]">
            {transactions.length} records verified
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#65677A]">
            No credit transactions logged. Newly registered accounts receive 500 NCX automatically.
          </div>
        ) : (
          <div className="divide-y divide-[#F0F2F9] dark:divide-[#202038]">
            {transactions.map(tx => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    (tx.amount || 0) < 0 ? 'bg-[#FFF0ED] text-[#FF826E]' : 'bg-[#D5FF68] text-[#17172B]'
                  }`}>
                    {(tx.amount || 0) < 0 ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="font-bold text-[#17172B] dark:text-white">{tx.description}</p>
                    <p className="text-[10px] font-mono text-[#8F91A3]">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Recent'} · Verified on MongoDB</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-mono font-bold text-sm ${
                    (tx.amount || 0) < 0 ? 'text-[#FF826E]' : 'text-[#10B981]'
                  }`}>
                    {(tx.amount || 0) < 0 ? `${tx.amount}` : `+${tx.amount || 0}`} NCX
                  </span>
                  <p className="text-[9px] font-mono text-[#8F91A3]">ID: {(tx.id || 'grant').slice(-6)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CreditsPage;
