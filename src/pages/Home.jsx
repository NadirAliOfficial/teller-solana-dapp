import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GoblinMascot from '@/components/ui/GoblinMascot';
import TimeRangeSelector from '@/components/ui/TimeRangeSelector';
import { useWallet } from '@/components/wallet/WalletContextLegacy';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function HomePage() {
  const { 
    connectedWallet, 
    trackedWallets, 
    getActiveWallets,
    solPrice,
    fetchSolPrice
  } = useWallet();

  const [timeRange, setTimeRange] = useState('week');
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState('usdc');

  const activeWallets = getActiveWallets();
  const hasWallets = activeWallets.length > 0;

  useEffect(() => {
    if (hasWallets) {
      loadMetrics();
    }
  }, [timeRange, customStart, customEnd, connectedWallet, trackedWallets]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const addresses = activeWallets.map(w => w.address);
      
      const response = await base44.functions.invoke('fetchRealMetrics', {
        addresses,
        limit: 100
      });

      const data = response.data;
      setMetrics({
        transactionCount: data.totalTransactions || 0,
        usdcVolume: data.totalUSDCVolume || 0,
        solVolume: data.totalSOLVolume || 0,
        lastUpdated: new Date(data.fetchedAt)
      });
    } catch (err) {
      console.error('Failed to load metrics:', err);
      setMetrics({
        transactionCount: 0,
        usdcVolume: 0,
        solVolume: 0,
        lastUpdated: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadMetrics();
    fetchSolPrice();
  };

  const handleCustomDateChange = (type, date) => {
    if (type === 'start') {
      setCustomStart(date);
    } else {
      setCustomEnd(date);
    }
  };

  const formatVolume = (usdc, sol) => {
    if (displayCurrency === 'sol') {
      return `◎ ${sol?.toFixed(2) || '0.00'}`;
    }
    return `$${usdc?.toFixed(2) || '0.00'}`;
  };

  const getSecondaryVolume = (usdc, sol) => {
    if (displayCurrency === 'sol') {
      return `≈ $${usdc?.toFixed(2) || '0.00'}`;
    }
    return `≈ ◎ ${sol?.toFixed(2) || '0.00'}`;
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'just now';
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Empty state
  if (!hasWallets) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 py-6 pb-24">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <GoblinMascot size="lg" />
          <h2 className="text-xl font-semibold text-white mt-6 mb-2">No Wallets Yet</h2>
          <p className="text-slate-400 text-center mb-6 max-w-xs">
            Connect your Seeker wallet or add an address to start tracking your activity
          </p>
          <Link to={createPageUrl('Connect')}>
            <Button className="bg-emerald-500 hover:bg-emerald-600 gap-2">
              <Wallet className="w-4 h-4" />
              Add Wallet
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1B2E] px-5 py-6 pb-24 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <GoblinMascot size="sm" animate={false} />
            <h1 className="text-2xl font-bold text-[#5EEAD4]">Teller</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            className="text-[#5EEAD4] hover:text-[#4DD4C0] hover:bg-[#5EEAD4]/10"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Status pill */}
        {connectedWallet && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            <div className="px-4 py-2 bg-[#5EEAD4]/20 text-[#5EEAD4] rounded-full font-medium">
              Seeker Wallet • Connected
            </div>
            <span className="text-slate-400 font-mono">
              {connectedWallet.slice(0, 4)}...{connectedWallet.slice(-4)}
            </span>
          </div>
        )}

      {/* Time Range */}
      <div className="mb-6">
        <TimeRangeSelector
          selected={timeRange}
          onSelect={setTimeRange}
          customStart={customStart}
          customEnd={customEnd}
          onCustomDateChange={handleCustomDateChange}
        />
      </div>

        {/* Metrics Cards - Two columns with glowing borders */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Transactions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl opacity-30 blur-xl" />
            <div className="relative bg-[#252641] border-2 border-violet-500/40 rounded-3xl p-5 backdrop-blur">
              <h3 className="text-slate-300 text-sm mb-2">Transactions</h3>
              <div className="flex items-end gap-2 mb-3">
                <p className="text-4xl font-bold text-white">
                  {loading ? '—' : metrics?.transactionCount || '0'}
                </p>
              </div>
              {/* Mini sparkline */}
              <svg className="w-full h-8" viewBox="0 0 100 20">
                <path d="M0,15 L20,12 L40,14 L60,8 L80,10 L100,5" 
                  stroke="#8B5CF6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </motion.div>

          {/* Volume Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl opacity-30 blur-xl" />
            <div className="relative bg-[#252641] border-2 border-emerald-400/40 rounded-3xl p-5 backdrop-blur">
              <h3 className="text-slate-300 text-sm mb-2">Volume</h3>
              <div className="mb-3">
                <p className="text-2xl font-bold text-white">
                  {loading ? '—' : formatVolume(metrics?.usdcVolume, metrics?.solVolume)}
                </p>
                {!loading && (
                  <p className="text-xs text-slate-400 mt-1">
                    {getSecondaryVolume(metrics?.usdcVolume, metrics?.solVolume)}
                  </p>
                )}
              </div>
              {/* Currency toggle */}
              <div className="flex items-center gap-2 text-xs">
                <span className={displayCurrency === 'usdc' ? 'text-white font-medium' : 'text-slate-500'}>
                  USDC
                </span>
                <button
                  onClick={() => setDisplayCurrency(displayCurrency === 'usdc' ? 'sol' : 'usdc')}
                  className="relative w-12 h-6 bg-[#5EEAD4] rounded-full transition-all"
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    displayCurrency === 'sol' ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
                <span className={displayCurrency === 'sol' ? 'text-white font-medium' : 'text-slate-500'}>
                  SOL
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Paper tear effect */}
        <div className="relative mb-4">
          <svg className="w-full h-8" viewBox="0 0 400 30" preserveAspectRatio="none">
            <path d="M0,0 L0,15 Q10,25 20,15 Q30,5 40,15 Q50,25 60,15 Q70,5 80,15 Q90,25 100,15 Q110,5 120,15 Q130,25 140,15 Q150,5 160,15 Q170,25 180,15 Q190,5 200,15 Q210,25 220,15 Q230,5 240,15 Q250,25 260,15 Q270,5 280,15 Q290,25 300,15 Q310,5 320,15 Q330,25 340,15 Q350,5 360,15 Q370,25 380,15 Q390,5 400,15 L400,0 Z" 
              fill="#252641" />
          </svg>
          <div className="bg-[#252641] border-2 border-[#5EEAD4]/50 px-6 py-3 flex items-center justify-between text-sm rounded-2xl shadow-[0_0_25px_rgba(94,234,212,0.4)]">
            <span className="text-[#5EEAD4]">Last updated</span>
            <span className="text-[#5EEAD4] font-semibold">
              {loading ? '—' : formatTimeAgo(metrics?.lastUpdated)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-4 flex justify-center">
        <Link to={createPageUrl('Insights')} className="w-3/4 max-w-sm">
          <Button 
            className="w-full border-2 border-[#5EEAD4] bg-slate-800/50 text-white hover:bg-[#5EEAD4]/20 rounded-2xl h-14 font-bold text-base shadow-[0_0_20px_rgba(94,234,212,0.3)] hover:shadow-[0_0_30px_rgba(94,234,212,0.5)] transition-all"
          >
            <Activity className="w-5 h-5 mr-2" />
            View Insights
          </Button>
        </Link>
      </div>
    </div>
  );
}