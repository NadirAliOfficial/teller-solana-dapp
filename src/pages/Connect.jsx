import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import GoblinMascot from '@/components/ui/GoblinMascot';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';

export default function ConnectPage() {
  const { connected } = useSolanaWallet();
  const navigate = useNavigate();

  // Redirect after successful connection
  useEffect(() => {
    if (connected) {
      navigate(createPageUrl('Home'));
    }
  }, [connected, navigate]);

  return (
    <div className="h-screen overflow-hidden bg-[#1A1B2E] flex flex-col relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        {/* Logo */}
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

        {/* Heading */}
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
          className="mb-8"
        >
          <GoblinMascot size="xl" />
        </motion.div>

        {/* Wallet Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="flex justify-center">
            <WalletMultiButton className="w-full max-w-xs h-14 !bg-[#5EEAD4] hover:!bg-[#4DD4C0] !text-[#1A1B2E] font-semibold rounded-2xl shadow-lg shadow-emerald-400/20 flex items-center justify-center gap-2" />
          </div>

          <div className="text-center pt-3">
            <span className="px-3 py-1.5 bg-[#5EEAD4]/20 text-[#5EEAD4] text-xs font-medium rounded-full">
              Solana Mobile Ready
            </span>
          </div>
        </motion.div>

        {/* Skip */}
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
    </div>
  );
}
