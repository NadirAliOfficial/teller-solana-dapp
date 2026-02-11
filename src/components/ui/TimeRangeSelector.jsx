import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';

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
      setShowCustomPicker(true);
    } else {
      onSelect(rangeId);
    }
  };

  return (
    <>
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
              {range.icon ? <range.icon className="w-3.5 h-3.5" /> : range.label}
            </motion.button>
          );
        })}
      </div>

      <Dialog open={showCustomPicker} onOpenChange={setShowCustomPicker}>
        <DialogContent className="bg-[#1A1B2E] border-2 border-[#5EEAD4]/50">
          <DialogHeader>
            <DialogTitle className="text-[#5EEAD4] text-xl font-bold">Select Date Range</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button
                onClick={() => setPickingFor('start')}
                className={`flex-1 rounded-2xl h-12 font-semibold transition-all ${
                  pickingFor === 'start' 
                    ? 'border-2 border-[#5EEAD4] bg-[#5EEAD4] text-[#1A1B2E] shadow-[0_0_25px_rgba(94,234,212,0.5)]' 
                    : 'border-2 border-[#5EEAD4]/30 bg-slate-800/50 text-[#5EEAD4] hover:bg-[#5EEAD4]/20 shadow-[0_0_15px_rgba(94,234,212,0.2)]'
                }`}
              >
                Start Date
              </Button>
              <Button
                onClick={() => setPickingFor('end')}
                className={`flex-1 rounded-2xl h-12 font-semibold transition-all ${
                  pickingFor === 'end' 
                    ? 'border-2 border-[#5EEAD4] bg-[#5EEAD4] text-[#1A1B2E] shadow-[0_0_25px_rgba(94,234,212,0.5)]' 
                    : 'border-2 border-[#5EEAD4]/30 bg-slate-800/50 text-[#5EEAD4] hover:bg-[#5EEAD4]/20 shadow-[0_0_15px_rgba(94,234,212,0.2)]'
                }`}
              >
                End Date
              </Button>
            </div>

            <div className="text-sm text-[#5EEAD4]/70 font-medium text-center py-2">
              {pickingFor === 'start' 
                ? `Start: ${customStart?.toLocaleDateString() || 'Not set'}`
                : `End: ${customEnd?.toLocaleDateString() || 'Not set'}`
              }
            </div>

            <CalendarPicker
              mode="single"
              selected={pickingFor === 'start' ? customStart : customEnd}
              onSelect={(date) => {
                onCustomDateChange(pickingFor, date);
                if (pickingFor === 'start') {
                  setPickingFor('end');
                }
              }}
              className="rounded-xl border-2 border-[#5EEAD4]/30"
            />

            <Button
              className="w-full border-2 border-[#5EEAD4] bg-[#5EEAD4] hover:bg-[#4DD4C0] text-[#1A1B2E] rounded-2xl h-14 font-bold text-base shadow-[0_0_25px_rgba(94,234,212,0.4)] hover:shadow-[0_0_35px_rgba(94,234,212,0.6)] transition-all disabled:opacity-50 disabled:shadow-none"
              onClick={() => {
                onSelect('custom');
                setShowCustomPicker(false);
              }}
              disabled={!customStart || !customEnd}
            >
              Apply Range
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}