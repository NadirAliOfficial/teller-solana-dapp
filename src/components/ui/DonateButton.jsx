import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// ── PLACEHOLDER: Replace with the developer/project wallet address ──
const DEV_WALLET = 'REPLACE_WITH_YOUR_WALLET_ADDRESS';
// ─────────────────────────────────────────────────────────────────────

const TIP_OPTIONS = [
  { label: '0.01 SOL', amount: 0.01 },
  { label: '0.05 SOL', amount: 0.05 },
  { label: '0.1 SOL', amount: 0.1 },
  { label: '0.5 SOL', amount: 0.5 },
];

export default function DonateButton({ compact = false }) {
  const { publicKey, sendTransaction, connected } = useSolanaWallet();
  const { connection } = useConnection();
  const [showTips, setShowTips] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  const handleDonate = async (amount) => {
    if (!connected || !publicKey) {
      setStatus('error');
      setStatusMsg('Connect your wallet first');
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    if (DEV_WALLET === 'REPLACE_WITH_YOUR_WALLET_ADDRESS') {
      setStatus('error');
      setStatusMsg('Developer wallet not configured');
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(DEV_WALLET),
          lamports: Math.round(amount * LAMPORTS_PER_SOL),
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      setStatus('success');
      setStatusMsg(`Sent ${amount} SOL — thank you!`);
      setShowTips(false);
    } catch (err) {
      console.error('Donation failed:', err);
      setStatus('error');
      setStatusMsg(err.message?.includes('rejected')
        ? 'Transaction cancelled'
        : 'Transaction failed — try again'
      );
    } finally {
      setSending(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowTips(!showTips)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 transition-all text-sm font-medium"
        >
          <Heart className="w-4 h-4" />
          Support Teller
        </button>

        <AnimatePresence>
          {showTips && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute bottom-full mb-2 left-0 right-0 bg-[#252641] border border-slate-700/50 rounded-2xl p-3 shadow-xl z-50 min-w-[220px]"
            >
              <p className="text-xs text-slate-400 mb-2 text-center">Choose an amount</p>
              <div className="grid grid-cols-2 gap-2">
                {TIP_OPTIONS.map((opt) => (
                  <button
                    key={opt.amount}
                    onClick={() => handleDonate(opt.amount)}
                    disabled={sending}
                    className="px-3 py-2 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-300 hover:bg-pink-500/20 transition-all text-sm font-medium disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`absolute top-full mt-2 left-0 right-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium min-w-[220px] ${
                status === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {status === 'success' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {statusMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[#252641] border border-pink-500/30 rounded-2xl p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <Heart className="w-5 h-5 text-pink-400" />
        <div>
          <h3 className="text-white font-medium">Support Teller</h3>
          <p className="text-slate-400 text-xs">Help us grow and improve the app</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {TIP_OPTIONS.map((opt) => (
          <button
            key={opt.amount}
            onClick={() => handleDonate(opt.amount)}
            disabled={sending || !connected}
            className="px-2 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-300 hover:bg-pink-500/20 transition-all text-sm font-medium disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : opt.label}
          </button>
        ))}
      </div>

      {!connected && (
        <p className="text-xs text-slate-500 text-center">Connect your wallet to donate</p>
      )}

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium mt-2 ${
              status === 'success'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {status === 'success' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {statusMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}