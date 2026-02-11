import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Chrome, Twitter, MessageCircle, Wallet, ArrowRight, Sparkles } from 'lucide-react';
import { useWallet as useWalletAdapter } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import GoblinMascot from '@/components/ui/GoblinMascot';
import AddWalletSheet from '@/components/wallet/AddWalletSheet';
import { useWallet } from '@/components/wallet/WalletContextLegacy';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';

export default function ConnectPage() {
  const { connected: isConnected, connecting, wallet } = useWalletAdapter();
  const { setVisible } = useWalletModal();
  const { connectedWallet, addTrackedWallet } = useWallet();
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [connectError, setConnectError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && connectedWallet) {
      navigate(createPageUrl('Home'));
    }
  }, [isConnected, connectedWallet, navigate]);

  const handleSeekerConnect = () => {
    try {
      setConnectError(null);
      setVisible(true);
    } catch (error) {
      console.error('Wallet connection error:', error);
      setConnectError('Failed to open wallet selector');
    }
  };

  const handleAddWallet = async (address, label) => {
    await addTrackedWallet(address, label);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#1A1B2E] flex flex-col relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        {/* Logo Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4"
        >
          <h1 className="text-4xl font-bold text-[#5EEAD4]">Teller</h1>
          <GoblinMascot size="sm" animate={false} />
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '80px' }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="h-1 bg-[#5EEAD4] rounded-full mb-12"
        />

        {/* Welcome heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-white mb-6 text-center"
        >
          Welcome to Teller
        </motion.h2>

        {/* Mascot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-6"
        >
          <GoblinMascot size="xl" />
        </motion.div>

        {/* Connect Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm space-y-4"
        >
          {connectError && (
            <p className="text-red-400 text-sm text-center">{connectError}</p>
          )}

          {/* Connect Button - Centered */}
          <div className="flex justify-center">
            <Button
              onClick={handleSeekerConnect}
              disabled={connecting}
              className="w-full max-w-xs h-14 bg-[#5EEAD4] hover:bg-[#4DD4C0] text-[#1A1B2E] font-semibold rounded-2xl shadow-lg shadow-emerald-400/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#1A1B2E]/30 border-t-[#1A1B2E] rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  <span>Connect Wallet</span>
                </>
              )}
            </Button>
          </div>

          {/* Optimized badge */}
          <div className="text-center pt-2">
            <span className="px-3 py-1.5 bg-[#5EEAD4]/20 text-[#5EEAD4] text-xs font-medium rounded-full">
              Seeker Phone Optimized
            </span>
          </div>
        </motion.div>

        {/* Continue without wallet */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6"
        >
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="text-slate-400 hover:text-white text-sm">
              Skip for now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Add Wallet Sheet */}
      <AddWalletSheet
        isOpen={showAddWallet}
        onClose={() => setShowAddWallet(false)}
        onAdd={handleAddWallet}
      />
    </div>
  );
}