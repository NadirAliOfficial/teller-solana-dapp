import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SolanaWalletAdapter from '@/components/wallet/SolanaWalletAdapter';
import { WalletProvider } from '@/components/wallet/WalletContext';
import BottomNav from '@/components/navigation/BottomNav';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Layout({ children, currentPageName }) {
  const isConnectPage = currentPageName === 'Connect';

  return (
    <SolanaWalletAdapter>
      <WalletProvider>
        <div className="min-h-screen bg-[#1A1B2E]">
          {/* Safe area padding for notch / dynamic island */}
          <div className="pt-safe">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPageName}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom navigation - hidden on Connect page */}
          {!isConnectPage && <BottomNav />}
        </div>

        {/* Global mobile + safe-area styles */}
        <style>{`
          :root {
            --sat: env(safe-area-inset-top);
            --sar: env(safe-area-inset-right);
            --sab: env(safe-area-inset-bottom);
            --sal: env(safe-area-inset-left);
          }

          .pt-safe {
            padding-top: max(0px, env(safe-area-inset-top));
          }

          .pb-safe {
            padding-bottom: max(16px, env(safe-area-inset-bottom));
          }

          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }

          * {
            -webkit-tap-highlight-color: transparent;
          }

          ::selection {
            background: rgba(16, 185, 129, 0.3);
          }

          body {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `}</style>
      </WalletProvider>
    </SolanaWalletAdapter>
  );
}
