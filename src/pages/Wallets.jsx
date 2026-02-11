import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet as useWalletAdapter } from '@solana/wallet-adapter-react';
import { 
  Wallet, 
  Plus, 
  Smartphone, 
  Trash2, 
  CheckCircle, 
  Circle,
  ExternalLink,
  Copy,
  Check,
  List,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWallet } from '@/components/wallet/WalletContextLegacy';
import AddWalletSheet from '@/components/wallet/AddWalletSheet';
import GoblinMascot from '@/components/ui/GoblinMascot';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function WalletsPage() {
  const { disconnect: disconnectAdapter } = useWalletAdapter();
  const { 
    connectedWallet, 
    walletLabel, 
    disconnectWallet,
    trackedWallets,
    addTrackedWallet,
    removeTrackedWallet,
    toggleWalletActive
  } = useWallet();

  const [showAddWallet, setShowAddWallet] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [walletLists, setWalletLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [showListSelector, setShowListSelector] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [timeRange, setTimeRange] = useState('today');
  const [walletMetrics, setWalletMetrics] = useState({});
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    loadWalletLists();
  }, []);

  useEffect(() => {
    if (trackedWallets.length > 0) {
      fetchMetrics();
    }
  }, [trackedWallets, timeRange]);

  const loadWalletLists = async () => {
    try {
      const user = await base44.auth.me();
      const lists = await base44.entities.WalletList.filter({ created_by: user.email });
      setWalletLists(lists);
      if (lists.length > 0 && !selectedList) {
        const defaultList = lists.find(l => l.is_default) || lists[0];
        setSelectedList(defaultList);
      }
    } catch (err) {
      console.error('Failed to load lists:', err);
    }
  };

  const createList = async () => {
    if (!newListName.trim() || walletLists.length >= 10) return;
    try {
      const list = await base44.entities.WalletList.create({
        name: newListName.trim(),
        wallet_ids: [],
        is_default: walletLists.length === 0
      });
      setWalletLists([...walletLists, list]);
      setSelectedList(list);
      setNewListName('');
    } catch (err) {
      console.error('Failed to create list:', err);
    }
  };

  const addWalletToList = async (address, label) => {
    const wallet = await addTrackedWallet(address, label);
    if (selectedList && wallet) {
      await base44.entities.WalletList.update(selectedList.id, {
        wallet_ids: [...(selectedList.wallet_ids || []), wallet.id]
      });
      loadWalletLists();
    }
  };

  const getListWallets = () => {
    if (!selectedList) return trackedWallets;
    return trackedWallets.filter(w => selectedList.wallet_ids?.includes(w.id));
  };

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const addresses = trackedWallets.map(w => w.address);
      const { data } = await base44.functions.invoke('fetchRealMetrics', {
        addresses,
        limit: timeRange === 'today' ? 1000 : timeRange === 'week' ? 7000 : 30000
      });
      
      const metricsMap = {};
      data.address_metrics?.forEach(metric => {
        metricsMap[metric.address] = {
          txCount: metric.transaction_count || 0,
          solVolume: metric.sol_volume || 0,
          usdcVolume: metric.usdc_volume || 0
        };
      });
      setWalletMetrics(metricsMap);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleCopy = async (address) => {
    await navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-[#1A1B2E] px-5 py-6 pb-24 relative">
      {/* Background blobs */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header with goblin icon */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <GoblinMascot size="sm" animate={false} />
        </div>

        {/* Connected section with goblin speech bubble */}
        <div className="mb-6 relative">
          {/* Speech bubble */}
          {!connectedWallet && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute -top-16 left-8 flex items-center gap-2"
            >
              <GoblinMascot size="sm" animate={false} className="flex-shrink-0" />
              <div className="relative bg-[#252641] border border-violet-500/30 rounded-2xl px-4 py-2 max-w-[180px]">
                <p className="text-xs text-slate-300">Teller tells you exactly what you need!</p>
                <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-[#252641] border-b-8 border-b-transparent" />
              </div>
            </motion.div>
          )}

          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GoblinMascot size="sm" animate={false} className="w-5 h-5" />
            Connected
          </h2>
        </div>

        {/* Seeker Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-[#252641] border-2 border-[#5EEAD4]/30 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white text-lg">Wallet:</h3>
                <p className="text-sm text-slate-400">
                  {connectedWallet ? 'Connected via MWA' : 'Not connected'}
                </p>
              </div>
            </div>

            {connectedWallet ? (
               <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 bg-[#1A1B2E] rounded-xl">
                   <p className="text-sm text-white font-mono">{truncateAddress(connectedWallet)}</p>
                   <div className="flex gap-2">
                     <button
                       onClick={() => handleCopy(connectedWallet)}
                       className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                     >
                       {copiedAddress === connectedWallet ? (
                         <Check className="w-4 h-4 text-emerald-400" />
                       ) : (
                         <Copy className="w-4 h-4" />
                       )}
                     </button>
                   </div>
                 </div>
                 <Button
                   onClick={async () => {
                     await disconnectWallet();
                     await disconnectAdapter();
                   }}
                   variant="outline"
                   className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl"
                 >
                   Disconnect
                 </Button>
               </div>
             ) : (
               <Link to={createPageUrl('Connect')} className="w-full">
                 <Button
                   className="w-full bg-[#5EEAD4] hover:bg-[#4DD4C0] text-[#1A1B2E] rounded-2xl h-12"
                 >
                   Use Connect page
                 </Button>
               </Link>
             )}
          </div>
        </motion.div>

        {/* List Selector and Time Range */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Tracked wallets</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchMetrics}
                disabled={loadingMetrics}
                className="p-2 bg-[#252641] rounded-lg text-slate-300 hover:bg-[#2d2e4d] disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loadingMetrics ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowListSelector(!showListSelector)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#252641] rounded-xl text-slate-300 text-sm hover:bg-[#2d2e4d]"
              >
                <List className="w-4 h-4" />
                {selectedList?.name || 'All'}
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 mb-3">
            {['today', 'week', 'month'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                  timeRange === range
                    ? 'bg-[#5EEAD4] text-[#1A1B2E]'
                    : 'bg-[#252641] text-slate-400 hover:bg-[#2d2e4d]'
                }`}
              >
                {range === 'today' ? 'Daily' : range === 'week' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>

          {showListSelector && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#252641] rounded-xl p-3 mb-3 space-y-2 max-h-48 overflow-y-auto"
            >
              <button
                onClick={() => { setSelectedList(null); setShowListSelector(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-white hover:bg-[#1A1B2E]"
              >
                All Wallets
              </button>
              {walletLists.map(list => (
                <button
                  key={list.id}
                  onClick={() => { setSelectedList(list); setShowListSelector(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white hover:bg-[#1A1B2E]"
                >
                  {list.name}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          <div className="space-y-3 mb-4">
            {getListWallets().map((wallet, index) => {
              const metrics = walletMetrics[wallet.address] || {
                txCount: 0,
                solVolume: 0,
                usdcVolume: 0
              };
              
              return (
                <motion.div
                  key={wallet.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#252641] rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">SOL</span>
                      <span className="text-white text-sm font-mono">{truncateAddress(wallet.address)}</span>
                    </div>
                    <button
                      onClick={() => removeTrackedWallet(wallet.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {loadingMetrics ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-[#1A1B2E] rounded-lg p-2 animate-pulse">
                          <div className="h-3 bg-slate-700 rounded mb-1"></div>
                          <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#1A1B2E] rounded-lg p-2">
                        <div className="text-[10px] text-slate-400 mb-0.5">TX</div>
                        <div className="text-white font-semibold text-sm">{metrics.txCount}</div>
                      </div>
                      <div className="bg-[#1A1B2E] rounded-lg p-2">
                        <div className="text-[10px] text-purple-400 mb-0.5">SOL Vol</div>
                        <div className="text-white font-semibold text-sm">{metrics.solVolume.toFixed(2)}</div>
                      </div>
                      <div className="bg-[#1A1B2E] rounded-lg p-2">
                        <div className="text-[10px] text-emerald-400 mb-0.5">USDC Vol</div>
                        <div className="text-white font-semibold text-sm">${metrics.usdcVolume.toFixed(2)}</div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Add wallet card - compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#252641] rounded-2xl p-4"
          >
            <h3 className="text-[#5EEAD4] font-bold mb-2">Add Solana wallet</h3>
            <p className="text-slate-400 text-xs mb-3">Read-only tracking</p>
            
            <Button
              onClick={() => setShowAddWallet(true)}
              className="w-full bg-[#5EEAD4] hover:bg-[#4DD4C0] text-[#1A1B2E] font-bold rounded-xl h-10 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add wallet
            </Button>
          </motion.div>

          {/* Wallet Lists Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-[#252641] rounded-2xl p-4"
          >
            <h3 className="text-white font-semibold mb-3 text-sm">Wallet Lists ({walletLists.length}/10)</h3>
            
            {walletLists.length < 10 && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="New list name"
                  className="flex-1 bg-[#1A1B2E] border border-slate-700 rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-500"
                  maxLength={30}
                />
                <Button
                  onClick={createList}
                  disabled={!newListName.trim()}
                  className="bg-[#5EEAD4] hover:bg-[#4DD4C0] text-[#1A1B2E] rounded-xl px-4 text-sm"
                >
                  Create
                </Button>
              </div>
            )}

            <div className="space-y-1.5">
              {walletLists.map(list => (
                <div
                  key={list.id}
                  className="flex items-center justify-between px-3 py-2 bg-[#1A1B2E] rounded-lg"
                >
                  <span className="text-white text-sm">{list.name}</span>
                  <span className="text-slate-500 text-xs">{list.wallet_ids?.length || 0}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add Wallet Sheet */}
      <AddWalletSheet
        isOpen={showAddWallet}
        onClose={() => setShowAddWallet(false)}
        onAdd={addWalletToList}
        walletLists={walletLists}
        selectedList={selectedList}
        onSelectList={setSelectedList}
      />
    </div>
  );
}