import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  loading = false,
  accentColor = 'mint',
  delay = 0 
}) {
  const colors = {
    mint: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
    purple: 'from-violet-500/20 to-violet-600/5 border-violet-500/30',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30'
  };

  const iconColors = {
    mint: 'text-emerald-400',
    purple: 'text-violet-400',
    blue: 'text-blue-400'
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-br ${colors[accentColor]} backdrop-blur-sm rounded-2xl p-5 border`}>
        <div className="flex items-start justify-between mb-3">
          <Skeleton className="h-4 w-24 bg-slate-700/50" />
          <Skeleton className="h-8 w-8 rounded-lg bg-slate-700/50" />
        </div>
        <Skeleton className="h-8 w-32 bg-slate-700/50 mb-2" />
        <Skeleton className="h-3 w-20 bg-slate-700/50" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileTap={{ scale: 0.98 }}
      className={`bg-gradient-to-br ${colors[accentColor]} backdrop-blur-sm rounded-2xl p-5 border active:opacity-90 transition-opacity`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg bg-slate-800/50 ${iconColors[accentColor]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && (
        <div className="text-xs text-slate-500">{subtitle}</div>
      )}
    </motion.div>
  );
}