import React from 'react';
import { motion } from 'framer-motion';
import { Home, Wallet, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const navItems = [
  { id: 'Home', label: 'Home', icon: Home },
  { id: 'Wallets', label: 'Wallets', icon: Wallet },
  { id: 'Insights', label: 'Insights', icon: BarChart3 },
];

export default function BottomNav() {
  const location = useLocation();
  
  // Extract page name from pathname
  const currentPage = location.pathname.split('/').pop() || 'Home';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1B2E]/95 backdrop-blur-lg px-2 pb-safe z-50">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentPage.toLowerCase() === item.id.toLowerCase();
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={createPageUrl(item.id)}
              className="flex flex-col items-center justify-center gap-1.5 py-2"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  isActive 
                    ? 'bg-[#5EEAD4]/20 border-[#5EEAD4]' 
                    : 'bg-transparent border-slate-600'
                }`}
              >
                <Icon 
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[#5EEAD4]' : 'text-slate-400'
                  }`} 
                />
              </motion.div>
              
              <span className={`text-[11px] transition-colors ${
                isActive 
                  ? 'text-white font-medium' 
                  : 'text-slate-500'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}