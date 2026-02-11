import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, DollarSign, Coins, ChevronRight } from 'lucide-react';
import { useWallet } from '@/components/wallet/WalletContext';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { userProfile, updateProfile } = useWallet();
  const [darkMode, setDarkMode] = useState(true);
  const [currency, setCurrency] = useState('usdc');

  useEffect(() => {
    if (userProfile) {
      setCurrency(userProfile.display_currency || 'usdc');
    }
  }, [userProfile]);

  const handleCurrencyChange = async (newCurrency) => {
    setCurrency(newCurrency);
    await updateProfile({ display_currency: newCurrency });
  };

  return (
    <div className="min-h-screen bg-[#1A1B2E] px-5 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-violet-500/20">
          <SettingsIcon className="w-6 h-6 text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      <div className="space-y-4">
        {/* Dark Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#252641] border border-slate-700/50 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-[#5EEAD4]" />
              ) : (
                <Sun className="w-5 h-5 text-[#5EEAD4]" />
              )}
              <div>
                <h3 className="text-white font-medium">Dark Mode</h3>
                <p className="text-slate-400 text-xs">Currently {darkMode ? 'enabled' : 'disabled'}</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-14 h-7 rounded-full transition-all ${
                darkMode ? 'bg-[#5EEAD4]' : 'bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-lg ${
                  darkMode ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </motion.div>

        {/* Currency Preference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#252641] border border-slate-700/50 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-[#5EEAD4]" />
            <div>
              <h3 className="text-white font-medium">Display Currency</h3>
              <p className="text-slate-400 text-xs">Choose your preferred currency</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleCurrencyChange('usdc')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                currency === 'usdc'
                  ? 'border-[#5EEAD4] bg-[#5EEAD4]/10 text-white'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">USDC</span>
            </button>
            <button
              onClick={() => handleCurrencyChange('sol')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                currency === 'sol'
                  ? 'border-[#5EEAD4] bg-[#5EEAD4]/10 text-white'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span className="font-medium">SOL</span>
            </button>
          </div>
        </motion.div>

        {/* Network (read-only for now) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#252641] border border-slate-700/50 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500" />
              <div>
                <h3 className="text-white font-medium">Network</h3>
                <p className="text-slate-400 text-xs">Solana Mainnet</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}