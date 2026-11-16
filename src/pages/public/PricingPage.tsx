import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Check, Zap, Shield, ArrowRight, RefreshCw } from 'lucide-react';
import Navbar from '../../components/Navbar';
import FinalCtaFooter from '../../components/sections/FinalCtaFooter';
import { BoxedButton } from '../../components/shared/BoxedButton';
import { useUser } from '../../context/UserContext';
import { api } from '../../lib/api';

export const PricingPage: React.FC = () => {
  const { user, isAuthenticated, refreshCredits } = useUser();
  const navigate = useNavigate();

  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [calcTokens, setCalcTokens] = useState<number>(500);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  // Conversion rates: 1 NCX = ~₹10 / $0.12
  const tokenToInr = (tokens: number) => Math.round(tokens * 9.99);
  const tokenToUsd = (tokens: number) => (tokens * 0.12).toFixed(2);

  const packs = [
    {
      id: 'pack-starter',
      name: 'Starter Pack',
      tokens: 500,
      priceINR: 4999,
      priceUSD: 59,
      badge: 'Popular for Founders',
      description: 'Ideal for validating 10 distinct project ideas with complete 17-section AI blueprints.',
      features: [
        '500 NCX Tokens credited immediately',
        'Enough for 10 Full AI Blueprint Scopes (50 NCX each)',
        'Interactive 17-Section Architecture Studio',
        'PDF & Markdown Blueprint Exports',
        'Community SLA Triage (72h review window)'
      ],
      highlight: false
    },
    {
      id: 'pack-pro',
      name: 'Pro Builder Pack',
      tokens: 2500,
      priceINR: 21999,
      priceUSD: 259,
      badge: 'Best Value for Startups',
      description: 'Designed for startups commissioning MVP builds with verified specialists and milestone escrow.',
      features: [
        '2,500 NCX Tokens credited immediately',
        '50 AI Blueprint Scoping generations',
        'Priority SLA Radar triage (sub-24h matching)',
        'Full Milestone Escrow Lockup system',
        'SHA-256 Deliverable ZIP inspection & verification',
        'Scope Change Impact Analyzer'
      ],
      highlight: true
    },
    {
      id: 'pack-enterprise',
      name: 'Enterprise Studio',
      tokens: 10000,
      priceINR: 79999,
      priceUSD: 949,
      badge: 'Dedicated Governance',
      description: 'For product studios, digital agencies, and enterprise teams managing multi-repo software portfolios.',
      features: [
        '10,000 NCX Tokens credited immediately',
        'Unlimited AI Blueprint iterations',
        'Dedicated Administrative Engineering Lead',
        'Custom multi-specialist team allocation',
        'Custom SLA contracts (sub-4h operational triage)',
        'Custom IP assignment & bespoke legal contracts'
      ],
      highlight: false
    }
  ];

  const handleSelectPack = (pack: any) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pricing');
      return;
    }
    setSelectedPack(pack);
    setPurchaseSuccess(null);
    setTopUpModalOpen(true);
  };

  const handleExecutePurchase = async () => {
    if (!selectedPack || !user) return;
    setPurchasing(true);
    setPurchaseSuccess(null);

    const price = currency === 'INR' ? selectedPack.priceINR : selectedPack.priceUSD;
    const res = await api.topUpCredits({
      userId: user.customId || user.id,
      packageId: selectedPack.id,
      tokens: selectedPack.tokens,
      amountPaid: price,
      currency,
      paymentMethod: 'card'
    });

    setPurchasing(false);
    if (res.success) {
      setPurchaseSuccess(`Success! +${selectedPack.tokens} NCX added to your vault.`);
      await refreshCredits();
      setTimeout(() => {
        setTopUpModalOpen(false);
      }, 1800);
    } else {
      alert(res.error || 'Failed to complete top-up.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#222438] font-sans antialiased">
      <Navbar />

      {/* Hero Header */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9E3FF] text-[#7357FF] text-xs font-mono font-bold tracking-wider uppercase">
          <Coins className="w-4 h-4" />
          <span>Transparent NCX Token Economy</span>
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-[#17172B] tracking-tight max-w-4xl mx-auto leading-tight">
          Pay for Real Value. <span className="bg-gradient-to-r from-[#7357FF] to-[#3978FF] bg-clip-text text-transparent">Zero Subscription Traps.</span>
        </h1>
        <p className="text-base sm:text-lg text-[#65677A] max-w-2xl mx-auto leading-relaxed">
          NexusCraft uses NCX tokens to power AI scoping blueprints and secure milestone escrow. No monthly lock-ins or recurring fees.
        </p>

        {/* Currency Switcher */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-white border border-[#E9EAF0] shadow-sm">
          <button
            onClick={() => setCurrency('INR')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currency === 'INR' ? 'bg-[#7357FF] text-white shadow-sm' : 'text-[#777B8A] hover:text-[#17172B]'
            }`}
          >
            ₹ INR (Indian Rupee)
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currency === 'USD' ? 'bg-[#7357FF] text-white shadow-sm' : 'text-[#777B8A] hover:text-[#17172B]'
            }`}
          >
            $ USD (US Dollar)
          </button>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="py-8 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packs.map(pack => (
            <div
              key={pack.id}
              className={`p-8 sm:p-10 rounded-3xl transition-all relative flex flex-col justify-between ${
                pack.highlight
                  ? 'bg-white border-2 border-[#7357FF] shadow-xl shadow-[#7357FF]/10 scale-105 z-10'
                  : 'bg-white border border-[#E9EAF0] shadow-sm hover:shadow-md'
              }`}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    pack.highlight ? 'bg-[#7357FF] text-white' : 'bg-[#F2F3F8] text-[#777B8A]'
                  }`}>
                    {pack.badge}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#7357FF]">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{pack.tokens} NCX</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-extrabold text-2xl text-[#17172B]">
                    {pack.name}
                  </h3>
                  <p className="text-xs text-[#777B8A] mt-1.5 leading-relaxed">
                    {pack.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2">
                  <span className="font-display font-extrabold text-4xl text-[#17172B]">
                    {currency === 'INR' ? `₹${pack.priceINR.toLocaleString('en-IN')}` : `$${pack.priceUSD}`}
                  </span>
                  <span className="text-xs text-[#777B8A] ml-2">one-time top-up</span>
                </div>

                {/* Feature Checklist */}
                <div className="pt-4 border-t border-[#F2F3F8] space-y-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#777B8A] block">
                    What's Included:
                  </span>
                  <ul className="space-y-2.5">
                    {pack.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-[#525468]">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <BoxedButton
                  variant={pack.highlight ? 'primary' : 'secondary'}
                  size="lg"
                  fullWidth
                  onClick={() => handleSelectPack(pack)}
                  className="flex items-center justify-center gap-2"
                >
                  <span>Top-Up {pack.tokens} NCX</span>
                  <ArrowRight className="w-4 h-4" />
                </BoxedButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Token Action Costs Table */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17172B]">
            What Does Each Action Cost in NexusCraft?
          </h2>
          <p className="text-xs sm:text-sm text-[#777B8A]">
            No hidden platform deductions. 100% transparent token consumption.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FC] border-b border-[#E9EAF0] text-[#777B8A] font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-5">Platform Action</th>
                <th className="py-3 px-5">NCX Cost</th>
                <th className="py-3 px-5">Equivalent (INR)</th>
                <th className="py-3 px-5">Equivalent (USD)</th>
                <th className="py-3 px-5">Escrow Protection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAF0] text-[#222438]">
              <tr>
                <td className="py-3.5 px-5 font-semibold">New Client Registration</td>
                <td className="py-3.5 px-5 font-mono text-emerald-600 font-bold">+500 NCX Bonus</td>
                <td className="py-3.5 px-5 text-[#777B8A]">₹0 (Free gift)</td>
                <td className="py-3.5 px-5 text-[#777B8A]">$0.00</td>
                <td className="py-3.5 px-5 text-emerald-600">Credited Instantly</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold">Idea Intake & 17-Section AI Blueprint</td>
                <td className="py-3.5 px-5 font-mono text-[#7357FF] font-bold">50 NCX</td>
                <td className="py-3.5 px-5 text-[#777B8A]">~₹499</td>
                <td className="py-3.5 px-5 text-[#777B8A]">~$5.90</td>
                <td className="py-3.5 px-5 text-[#777B8A]">One-time fee</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold">Sample Blueprint / Portfolio Preview</td>
                <td className="py-3.5 px-5 font-mono text-emerald-600 font-bold">0 NCX (Free)</td>
                <td className="py-3.5 px-5 text-[#777B8A]">₹0</td>
                <td className="py-3.5 px-5 text-[#777B8A]">$0.00</td>
                <td className="py-3.5 px-5 text-[#777B8A]">Public Access</td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-semibold">Milestone Development Escrow</td>
                <td className="py-3.5 px-5 font-mono font-bold">Quoted Milestone</td>
                <td className="py-3.5 px-5 text-[#777B8A]">Exact milestone value</td>
                <td className="py-3.5 px-5 text-[#777B8A]">Exact milestone value</td>
                <td className="py-3.5 px-5 text-emerald-600 font-bold">100% Protected Escrow</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive Token Calculator */}
      <section className="py-12 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#17172B] to-[#252542] text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#D5FF68]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-white">
                Interactive NCX Token Calculator
              </h3>
              <p className="text-xs text-white/70">
                Estimate how many tokens your team needs for scoping and execution.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono text-white/80">
              <span>Token Quantity: {calcTokens} NCX</span>
              <span>Can generate {Math.floor(calcTokens / 50)} Complete AI Blueprints</span>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={calcTokens}
              onChange={e => setCalcTokens(Number(e.target.value))}
              className="w-full accent-[#7357FF] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-mono uppercase text-white/60 block">NCX Value</span>
              <span className="font-mono font-bold text-xl text-[#D5FF68]">{calcTokens} NCX</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-mono uppercase text-white/60 block">Approx. INR</span>
              <span className="font-mono font-bold text-xl text-white">₹{tokenToInr(calcTokens).toLocaleString('en-IN')}</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-white/60 block">Approx. USD</span>
              <span className="font-mono font-bold text-xl text-white">${tokenToUsd(calcTokens)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Top-Up Modal Simulation */}
      {topUpModalOpen && selectedPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white border border-[#E9EAF0] shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#7357FF]" />
                <h3 className="font-display font-bold text-lg text-[#17172B]">
                  Top-Up NCX Tokens
                </h3>
              </div>
              <button
                onClick={() => setTopUpModalOpen(false)}
                className="text-xs text-[#777B8A] hover:text-[#17172B]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E9EAF0] space-y-2">
              <div className="flex justify-between text-xs font-semibold text-[#17172B]">
                <span>Selected Package:</span>
                <span className="font-mono text-[#7357FF]">{selectedPack.name}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-[#17172B]">
                <span>Tokens to Credit:</span>
                <span className="font-mono">+{selectedPack.tokens} NCX</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#17172B] pt-2 border-t border-[#E9EAF0]">
                <span>Total Amount:</span>
                <span>{currency === 'INR' ? `₹${selectedPack.priceINR.toLocaleString('en-IN')}` : `$${selectedPack.priceUSD}`}</span>
              </div>
            </div>

            {purchaseSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                {purchaseSuccess}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#777B8A]">
                  Secure simulated gateway for INR/USD. This will immediately credit tokens to your NCX Vault and record an immutable transaction ledger entry.
                </p>
                <BoxedButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={purchasing}
                  onClick={handleExecutePurchase}
                  className="flex items-center justify-center gap-2"
                >
                  {purchasing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Confirm & Credit {selectedPack.tokens} NCX</span>
                    </>
                  )}
                </BoxedButton>
              </div>
            )}
          </div>
        </div>
      )}

      <FinalCtaFooter />
    </div>
  );
};

export default PricingPage;
