import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SolanaWalletAdapter from '@/components/wallet/SolanaWalletAdapter';
import { WalletContextProvider } from '@/components/wallet/WalletContextLegacy';
import BottomNav from '@/components/navigation/BottomNav';

const pageVariants = {
  initial: { 
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function Layout({ children, currentPageName }) {
  const isConnectPage = currentPageName === 'Connect';

  return (
    <SolanaWalletAdapter>
      <WalletContextProvider>
        <div className="min-h-screen bg-[#1A1B2E]">
        {/* Safe area padding for notch/dynamic island */}
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
        
        {/* Bottom navigation - hide on connect page */}
        {!isConnectPage && <BottomNav />}
        </div>
        
        {/* Global styles for safe areas and mobile optimization */}
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
        
        /* Hide scrollbar but allow scrolling */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Android ripple effect simulation */
        .ripple {
          position: relative;
          overflow: hidden;
        }
        .ripple::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.15s;
        }
        .ripple:active::after {
          opacity: 1;
        }
        
        /* Smooth transitions */
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Custom selection color */
        ::selection {
          background: rgba(16, 185, 129, 0.3);
        }
        
        /* Font smoothing */
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
      </WalletContextProvider>
    </SolanaWalletAdapter>
  );
}