import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import type { WalletTransaction } from '../types';
import { ShieldCheck, Download, PlusCircle, ArrowUpRight, DollarSign, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';
export const WalletPage: React.FC = () => {
  const { user, updateUserBalance } = useUser();

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [depositAmount, setDepositAmount] = useState<number>(1500);
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const PRESETS = [250, 500, 1000, 2500, 5000];

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || depositAmount <= 0) return;

    if (actionType === 'deposit') {
      updateUserBalance(depositAmount, 'deposit');
      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        type: 'Deposit',
        amount: depositAmount,
        projectTitle: 'Custom Wallet Deposit via Escrow Gateway',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: 'Completed',
        referenceNo: `NEX-${Math.floor(10000 + Math.random() * 90000)}-DEP`,
      };
      setTransactions([newTx, ...transactions]);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setSuccessMsg(`Successfully deposited custom amount of $${depositAmount.toLocaleString()} into your wallet!`);
    } else {
      updateUserBalance(depositAmount, 'withdraw');
      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        type: 'Withdrawal',
        amount: depositAmount,
        projectTitle: 'Withdrawal to Connected Bank Account',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: 'Completed',
        referenceNo: `NEX-${Math.floor(10000 + Math.random() * 90000)}-WTH`,
      };
      setTransactions([newTx, ...transactions]);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setSuccessMsg(`Successfully processed custom withdrawal of $${depositAmount.toLocaleString()} to your bank!`);
    }

    setModalOpen(false);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="pt-28 pb-24 bg-slate-950 min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">SECURE ESCROW WALLET // CUSTOM AMOUNTS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Payments & Escrow Ledger</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActionType('withdraw');
                setModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <ArrowUpRight className="w-4 h-4 text-cyan-400" />
              <span>Withdraw Funds</span>
            </button>

            <button
              onClick={() => {
                setActionType('deposit');
                setModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add / Customize Funds</span>
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold mb-6 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Balance Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="glass-card border border-slate-800 p-6 rounded-3xl relative overflow-hidden bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">AVAILABLE BALANCE</div>
            <div className="text-3xl font-extrabold text-white font-mono">${(user?.balance || 0).toLocaleString()}</div>
            <div className="text-[10px] font-mono text-emerald-400 font-semibold mt-2">● Ready for milestone payout funding</div>
          </div>

          <div className="glass-card border border-indigo-500/30 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">HELD IN SECURE ESCROW</div>
            <div className="text-3xl font-extrabold text-cyan-300 font-mono">${(user?.escrowBalance || 0).toLocaleString()}</div>
            <div className="text-[10px] font-mono text-cyan-400 font-semibold mt-2">Locked for active contract approvals</div>
          </div>

          <div className="glass-card border border-slate-800 p-6 rounded-3xl bg-slate-900/95">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">TOTAL ESCROW LEDGER VOLUME</div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">${((user?.balance || 0) + (user?.escrowBalance || 0)).toLocaleString()}</div>
            <div className="text-[10px] font-mono text-slate-400 font-semibold mt-2">100% End-to-End Protection Guarantee</div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="glass-card border border-slate-800/80 rounded-3xl p-6 bg-slate-900/95">
          <h3 className="text-lg font-bold text-white mb-6">Transaction History & Invoices</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs font-mono text-slate-400 uppercase">
                  <th className="pb-4">Transaction ID</th>
                  <th className="pb-4">Type</th>
                  <th className="pb-4">Description</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4 text-right">Amount</th>
                  <th className="pb-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs font-mono">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-mono text-xs">
                      💳 No transaction records yet. Deposit custom funds or complete milestones to build your payment ledger!
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 text-slate-400">{tx.referenceNo}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${tx.type === 'Deposit' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 font-sans font-bold text-white max-w-xs truncate">{tx.projectTitle}</td>
                      <td className="py-4 text-slate-400">{tx.date}</td>
                      <td className="py-4 text-right font-extrabold text-emerald-400">${tx.amount.toLocaleString()}</td>
                      <td className="py-4 text-right">
                        <button className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Download Invoice">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customize Money Amount Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 relative space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white capitalize">
                {actionType === 'deposit' ? '+ Deposit Custom Amount' : '↑ Withdraw Custom Amount'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                CUSTOMIZABLE
              </span>
            </div>

            <form onSubmit={handleTransactionSubmit} className="space-y-4 text-xs">
              {/* Presets */}
              <div>
                <label className="block text-slate-400 font-mono mb-2">Select Quick Preset:</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {PRESETS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setDepositAmount(val);
                        setIsCustomAmount(false);
                      }}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                        depositAmount === val && !isCustomAmount
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input Option */}
              <div>
                <label className="block text-slate-300 font-mono font-bold mb-1 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Customize Exact Amount ($ USD):</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-cyan-400 font-mono font-bold text-base">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={depositAmount || ''}
                    onChange={(e) => {
                      setDepositAmount(Number(e.target.value));
                      setIsCustomAmount(true);
                    }}
                    placeholder="Enter custom amount (e.g. 1750)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm text-white font-mono font-bold focus:outline-none focus:border-cyan-500/60"
                    required
                  />
                </div>
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  Type any custom dollar amount you wish to {actionType === 'deposit' ? 'deposit' : 'withdraw'}.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold text-xs shadow-lg"
                >
                  Confirm {actionType === 'deposit' ? 'Deposit' : 'Withdrawal'} (${depositAmount.toLocaleString()})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
