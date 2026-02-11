import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, AlertCircle, Check } from 'lucide-react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Client-side validation using @solana/web3.js
function isValidSolanaAddress(address) {
  if (!address || typeof address !== 'string') return false;
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export default function AddWalletSheet({ isOpen, onClose, onAdd, walletLists = [], selectedList, onSelectList }) {
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showLists, setShowLists] = useState(false);

  const handleSubmit = async () => {
    setError('');
    
    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }
    
    if (!isValidSolanaAddress(address.trim())) {
      setError('Invalid Solana address format');
      return;
    }
    
    setIsAdding(true);
    try {
      await onAdd(address.trim(), label.trim());
      setAddress('');
      setLabel('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add wallet');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl z-50 p-6 pb-32 border-t border-slate-700 max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-500/20">
                  <Wallet className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Add Wallet</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            {/* Form */}
            <div className="space-y-4">
              {walletLists.length > 0 && (
                <div>
                  <Label className="text-slate-400 text-sm mb-2 block">Add to List</Label>
                  <button
                    onClick={() => setShowLists(!showLists)}
                    className="w-full flex items-center justify-between bg-slate-800 border border-slate-700 text-white h-10 rounded-xl px-3"
                  >
                    <span className="text-sm">{selectedList?.name || 'Select list'}</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </button>
                  {showLists && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 bg-slate-800 border border-slate-700 rounded-xl p-2 space-y-1 max-h-32 overflow-y-auto"
                    >
                      {walletLists.map(list => (
                        <button
                          key={list.id}
                          onClick={() => { onSelectList(list); setShowLists(false); }}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-white hover:bg-slate-700"
                        >
                          {list.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="address" className="text-slate-400 text-sm mb-2 block">
                  Solana Address
                </Label>
                <Input
                  id="address"
                  placeholder="Enter wallet address"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setError('');
                  }}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-10 rounded-xl text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="label" className="text-slate-400 text-sm mb-2 block">
                  Label (optional)
                </Label>
                <Input
                  id="label"
                  placeholder="e.g., Main wallet"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-10 rounded-xl text-sm"
                />
              </div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
              
              <Button
                onClick={handleSubmit}
                disabled={isAdding}
                className="w-full h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl text-sm"
              >
                {isAdding ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Add Wallet
                  </div>
                )}
              </Button>
              
              <p className="text-xs text-slate-500 text-center">
                This wallet will be added for read-only tracking
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}