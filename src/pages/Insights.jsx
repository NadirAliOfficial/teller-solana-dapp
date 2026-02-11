import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, RefreshCw, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TimeRangeSelector from '@/components/ui/TimeRangeSelector';
import GoblinMascot from '@/components/ui/GoblinMascot';
import { useWallet } from '@/components/wallet/WalletContextLegacy';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function InsightsPage() {
  const { getActiveWallets, solPrice } = useWallet();
  const [timeRange, setTimeRange] = useState('week');
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('count');

  const activeWallets = getActiveWallets();
  const hasWallets = activeWallets.length > 0;

  useEffect(() => {
    if (hasWallets) {
      loadMetrics();
    }
  }, [timeRange, customStart, customEnd]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const addresses = activeWallets.map(w => w.address);
      
      const response = await base44.functions.invoke('fetchRealMetrics', {
        addresses,
        limit: 100
      });

      const data = response.data;
      setMetrics({
        transactionCount: data.totalTransactions || 0,
        usdcVolume: data.totalUSDCVolume || 0,
        solVolume: data.totalSOLVolume || 0,
        addressMetrics: data.addressMetrics || {}
      });
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateChange = (type, date) => {
    if (type === 'start') setCustomStart(date);
    else setCustomEnd(date);
  };

  // Transform address metrics for charts
  const chartData = metrics?.addressMetrics 
    ? Object.entries(metrics.addressMetrics).map(([address, data]) => ({
        address: `${address.slice(0, 4)}...${address.slice(-4)}`,
        count: data.transactionCount || 0,
        usdcVolume: Math.round(data.usdcVolume || 0),
        solVolume: parseFloat((data.solVolume || 0).toFixed(2))
      }))
    : [];

  // Empty state
  if (!hasWallets) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 py-6 pb-24">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <GoblinMascot size="lg" />
          <h2 className="text-xl font-semibold text-white mt-6 mb-2">No Data Yet</h2>
          <p className="text-slate-400 text-center mb-6 max-w-xs">
            Add a wallet to see your transaction insights
          </p>
          <Link to={createPageUrl('Wallets')}>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              Go to Wallets
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {viewMode === 'count' 
                ? `${entry.value} transactions`
                : `$${entry.value} USDC`
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Insights</h1>
          <p className="text-sm text-slate-400">Visualize your activity</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={loadMetrics}
          disabled={loading}
          className="text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Time Range */}
      <div className="mb-6">
        <TimeRangeSelector
          selected={timeRange}
          onSelect={setTimeRange}
          customStart={customStart}
          customEnd={customEnd}
          onCustomDateChange={handleCustomDateChange}
        />
      </div>

      {/* View Toggle */}
      <div className="mb-6">
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList className="bg-slate-800/50 p-1 rounded-xl w-full">
            <TabsTrigger 
              value="count" 
              className="flex-1 rounded-lg data-[state=active]:bg-violet-600"
            >
              <Activity className="w-4 h-4 mr-2" />
              Count
            </TabsTrigger>
            <TabsTrigger 
              value="volume"
              className="flex-1 rounded-lg data-[state=active]:bg-emerald-600"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Volume
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-slate-800/30 border-slate-700/50 p-4 rounded-xl">
          <p className="text-xs text-slate-500 mb-1">Total Transactions</p>
          <p className="text-xl font-bold text-white">
            {loading ? '—' : metrics?.transactionCount?.toLocaleString()}
          </p>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700/50 p-4 rounded-xl">
          <p className="text-xs text-slate-500 mb-1">Total Volume</p>
          <p className="text-xl font-bold text-emerald-400">
            {loading ? '—' : `$${metrics?.usdcVolume?.toFixed(0)}`}
          </p>
        </Card>
      </div>

      {/* Charts */}
      {viewMode === 'count' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key="count-chart"
        >
          <Card className="bg-slate-800/20 border-slate-700/50 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold text-white">Transactions by Wallet</h3>
            </div>
            
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="address" 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      fill="#8b5cf6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key="volume-chart"
        >
          <Card className="bg-slate-800/20 border-slate-700/50 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white">Volume by Wallet</h3>
            </div>
            
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="address" 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone"
                      dataKey="usdcVolume" 
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Price indicator */}
      {solPrice && (
        <div className="text-center text-xs text-slate-600 mt-4">
          SOL/USDC: ${solPrice.toFixed(2)}
        </div>
      )}
    </div>
  );
}