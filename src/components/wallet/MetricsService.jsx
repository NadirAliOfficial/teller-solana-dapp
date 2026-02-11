// Metrics calculation service using Helius API with RPC fallback

const HELIUS_API_KEY = ''; // Set via environment
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

export async function fetchWalletMetrics(addresses, startDate, endDate) {
  const metrics = {
    transactionCount: 0,
    usdcVolume: 0,
    solVolume: 0,
    dailyData: {},
    lastUpdated: new Date()
  };

  for (const address of addresses) {
    try {
      const result = await fetchAddressMetrics(address, startDate, endDate);
      metrics.transactionCount += result.transactionCount;
      metrics.usdcVolume += result.usdcVolume;
      metrics.solVolume += result.solVolume;
      
      // Merge daily data
      Object.entries(result.dailyData).forEach(([date, data]) => {
        if (!metrics.dailyData[date]) {
          metrics.dailyData[date] = { count: 0, usdcVolume: 0, solVolume: 0 };
        }
        metrics.dailyData[date].count += data.count;
        metrics.dailyData[date].usdcVolume += data.usdcVolume;
        metrics.dailyData[date].solVolume += data.solVolume;
      });
    } catch (err) {
      console.error(`Error fetching metrics for ${address}:`, err);
    }
  }

  return metrics;
}

async function fetchAddressMetrics(address, startDate, endDate) {
  // Try Helius first
  if (HELIUS_API_KEY) {
    try {
      return await fetchFromHelius(address, startDate, endDate);
    } catch (err) {
      console.log('Helius failed, trying RPC fallback');
    }
  }
  
  // Fallback to Solana RPC
  return await fetchFromRPC(address, startDate, endDate);
}

async function fetchFromHelius(address, startDate, endDate) {
  const startTimestamp = Math.floor(startDate.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);
  
  const response = await fetch(
    `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=100`
  );
  
  if (!response.ok) throw new Error('Helius API error');
  
  const transactions = await response.json();
  
  return processTransactions(transactions, startTimestamp, endTimestamp, address);
}

async function fetchFromRPC(address, startDate, endDate) {
  const startTimestamp = Math.floor(startDate.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);
  
  // Get signatures
  const sigResponse = await fetch(SOLANA_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params: [address, { limit: 100 }]
    })
  });
  
  const sigData = await sigResponse.json();
  const signatures = sigData.result || [];
  
  // Filter by time range
  const filteredSigs = signatures.filter(sig => 
    sig.blockTime >= startTimestamp && sig.blockTime <= endTimestamp
  );
  
  // Get transaction details (batch)
  const transactions = [];
  for (const sig of filteredSigs.slice(0, 50)) { // Limit for demo
    try {
      const txResponse = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [sig.signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
        })
      });
      const txData = await txResponse.json();
      if (txData.result) {
        transactions.push({
          ...txData.result,
          signature: sig.signature,
          timestamp: sig.blockTime
        });
      }
    } catch (err) {
      console.error('Error fetching tx:', err);
    }
  }
  
  return processRPCTransactions(transactions, address);
}

function processTransactions(transactions, startTimestamp, endTimestamp, address) {
  const metrics = {
    transactionCount: 0,
    usdcVolume: 0,
    solVolume: 0,
    dailyData: {}
  };
  
  for (const tx of transactions) {
    if (tx.timestamp < startTimestamp || tx.timestamp > endTimestamp) continue;
    
    metrics.transactionCount++;
    
    const date = new Date(tx.timestamp * 1000).toISOString().split('T')[0];
    if (!metrics.dailyData[date]) {
      metrics.dailyData[date] = { count: 0, usdcVolume: 0, solVolume: 0 };
    }
    metrics.dailyData[date].count++;
    
    // Process native transfers (SOL)
    if (tx.nativeTransfers) {
      for (const transfer of tx.nativeTransfers) {
        if (transfer.fromUserAccount === address || transfer.toUserAccount === address) {
          const lamports = Math.abs(transfer.amount || 0);
          const sol = lamports / 1e9;
          metrics.solVolume += sol;
          metrics.dailyData[date].solVolume += sol;
        }
      }
    }
    
    // Process token transfers (USDC)
    if (tx.tokenTransfers) {
      for (const transfer of tx.tokenTransfers) {
        if (transfer.mint === USDC_MINT) {
          if (transfer.fromUserAccount === address || transfer.toUserAccount === address) {
            const amount = Math.abs(transfer.tokenAmount || 0);
            metrics.usdcVolume += amount;
            metrics.dailyData[date].usdcVolume += amount;
          }
        }
      }
    }
  }
  
  return metrics;
}

function processRPCTransactions(transactions, address) {
  const metrics = {
    transactionCount: transactions.length,
    usdcVolume: 0,
    solVolume: 0,
    dailyData: {}
  };
  
  for (const tx of transactions) {
    const date = new Date(tx.timestamp * 1000).toISOString().split('T')[0];
    if (!metrics.dailyData[date]) {
      metrics.dailyData[date] = { count: 0, usdcVolume: 0, solVolume: 0 };
    }
    metrics.dailyData[date].count++;
    
    // Parse transaction for transfers
    const meta = tx.meta;
    if (!meta) continue;
    
    // SOL balance changes
    const preBalances = meta.preBalances || [];
    const postBalances = meta.postBalances || [];
    const accountKeys = tx.transaction?.message?.accountKeys || [];
    
    for (let i = 0; i < accountKeys.length; i++) {
      const key = accountKeys[i].pubkey || accountKeys[i];
      if (key === address) {
        const diff = Math.abs((postBalances[i] || 0) - (preBalances[i] || 0));
        const sol = diff / 1e9;
        if (sol > 0.00001) { // Filter dust
          metrics.solVolume += sol;
          metrics.dailyData[date].solVolume += sol;
        }
      }
    }
    
    // Token balance changes (simplified)
    const preTokenBalances = meta.preTokenBalances || [];
    const postTokenBalances = meta.postTokenBalances || [];
    
    for (const post of postTokenBalances) {
      if (post.mint === USDC_MINT) {
        const pre = preTokenBalances.find(p => p.accountIndex === post.accountIndex);
        const preAmount = pre?.uiTokenAmount?.uiAmount || 0;
        const postAmount = post.uiTokenAmount?.uiAmount || 0;
        const diff = Math.abs(postAmount - preAmount);
        if (diff > 0) {
          metrics.usdcVolume += diff;
          metrics.dailyData[date].usdcVolume += diff;
        }
      }
    }
  }
  
  return metrics;
}

export function getDateRange(rangeType, customStart, customEnd) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (rangeType) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    case 'week':
      return {
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      };
    case 'month':
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now
      };
    case 'year':
      return {
        start: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000),
        end: now
      };
    case 'custom':
      return {
        start: customStart || today,
        end: customEnd || now
      };
    default:
      return {
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      };
  }
}

// Demo data generator for testing without API
export function generateDemoMetrics(rangeType) {
  const { start, end } = getDateRange(rangeType);
  const days = Math.ceil((end - start) / (24 * 60 * 60 * 1000));
  
  const dailyData = {};
  let totalCount = 0;
  let totalUsdc = 0;
  let totalSol = 0;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const count = Math.floor(Math.random() * 15) + 1;
    const usdcVolume = Math.random() * 500 + 10;
    const solVolume = Math.random() * 5 + 0.1;
    
    dailyData[dateStr] = { count, usdcVolume, solVolume };
    totalCount += count;
    totalUsdc += usdcVolume;
    totalSol += solVolume;
  }
  
  return {
    transactionCount: totalCount,
    usdcVolume: totalUsdc,
    solVolume: totalSol,
    dailyData,
    lastUpdated: new Date()
  };
}