import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';

const ranges = [
  { id: 'today', label: 'Today', color: 'violet' },
  { id: 'week', label: 'Week', color: 'cyan' },
  { id: 'month', label: 'Month', color: 'pink' },
  { id: 'year', label: 'Year', color: 'emerald' },
  { id: 'custom', label: 'Custom', icon: Calendar, color: 'amber' }
];

const neonStyles = {
  violet: {
    selected: 'bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.6)] border-2 border-violet-400',
    unselected: 'bg-[#252641] text-violet-300 border border-violet-500/30 hover:border-violet-400/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]'
  },
  cyan: {
    selected: 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] border-2 border-cyan-400',
    unselected: 'bg-[#252641] text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]'
  },
  pink: {
    selected: 'bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.6)] border-2 border-pink-400',
    unselected: 'bg-[#252641] text-pink-300 border border-pink-500/30 hover:border-pink-400/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]'
  },
  emerald: {
    selected: 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)] border-2 border-emerald-400',
    unselected: 'bg-[#252641] text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
  },
  amber: {
    selected: 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.6)] border-2 border-amber-400',
    unselected: 'bg-[#252641] text-amber-300 border border-amber-500/30 hover:border-amber-400/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]'
  }
};

export default function TimeRangeSelector({ 
  selected, 
  onSelect, 
  customStart, 
  customEnd,
  onCustomDateChange 
}) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [pickingFor, setPickingFor] = useState('start');

  const handleSelect = (rangeId) => {
    if (rangeId === 'custom') {
      setShowCustomPicker(!showCustomPicker);
    } else {
      setShowCustomPicker(false);
      onSelect(rangeId);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      <div className="flex gap-2 justify-center overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {ranges.map((range) => {
          const isSelected = selected === range.id;
          const styles = neonStyles[range.color];
          return (
            <motion.button
              key={range.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(range.id)}
              className={`
                flex items-center gap-1.5 ${range.icon ? 'px-2 py-1.5' : 'px-3 py-1.5'} rounded-full text-xs font-semibold whitespace-nowrap
                transition-all duration-300
                ${isSelected ? styles.selected : styles.unselected}
              `}
            >
              {range.icon ? <range.icon className="w-3.5 h-3.5" /> : null}
              {range.label}
            </motion.button>
          );
        })}
      </div>

      {/* Custom date picker inline panel */}
      <AnimatePresence>
        {showCustomPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-[#252641] border-2 border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setPickingFor('start')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    pickingFor === 'start'
                      ? 'bg-[#5EEAD4] text-[#1A1B2E] shadow-[0_0_15px_rgba(94,234,212,0.4)]'
                      : 'bg-[#1A1B2E] text-slate-400 hover:text-white'
                  }`}
                >
                  Start Date
                </button>
                <button
                  onClick={() => setPickingFor('end')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    pickingFor === 'end'
                      ? 'bg-[#5EEAD4] text-[#1A1B2E] shadow-[0_0_15px_rgba(94,234,212,0.4)]'
                      : 'bg-[#1A1B2E] text-slate-400 hover:text-white'
                  }`}
                >
                  End Date
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={
                    pickingFor === 'start'
                      ? customStart?.toISOString().split('T')[0] || ''
                      : customEnd?.toISOString().split('T')[0] || ''
                  }
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : null;
                    if (onCustomDateChange) {
                      onCustomDateChange(pickingFor, date);
                    }
                    if (pickingFor === 'start' && date) {
                      setPickingFor('end');
                    }
                  }}
                  className="flex-1 bg-[#1A1B2E] border border-slate-700 text-white rounded-xl px-3 py-2 text-sm [color-scheme:dark]"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Start: {formatDate(customStart)}</span>
                <span>End: {formatDate(customEnd)}</span>
              </div>

              <button
                onClick={() => {
                  if (customStart && customEnd) {
                    onSelect('custom');
                    setShowCustomPicker(false);
                  }
                }}
                disabled={!customStart || !customEnd}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all bg-[#5EEAD4] text-[#1A1B2E] shadow-[0_0_20px_rgba(94,234,212,0.4)] hover:shadow-[0_0_30px_rgba(94,234,212,0.6)] disabled:opacity-40 disabled:shadow-none"
              >
                Apply Range
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
