import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { addresses, limit = 100 } = await req.json();

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return Response.json(
        { error: 'addresses must be a non-empty array' },
        { status: 400 }
      );
    }

    const metrics = {
      totalTransactions: 0,
      totalUSDCVolume: 0,
      totalSOLVolume: 0,
      addressMetrics: {},
      fetchedAt: new Date().toISOString()
    };

    for (const address of addresses) {
      try {
        const addressMetrics = await fetchAddressMetrics(address, limit);
        metrics.addressMetrics[address] = addressMetrics;
        metrics.totalTransactions += addressMetrics.transactionCount;
        metrics.totalUSDCVolume += addressMetrics.usdcVolume;
        metrics.totalSOLVolume += addressMetrics.solVolume;
      } catch (err) {
        console.error(`Failed to fetch metrics for ${address}:`, err.message);
        metrics.addressMetrics[address] = { 
          transactionCount: 0,
          usdcVolume: 0,
          solVolume: 0,
          error: err.message 
        };
      }
    }

    return Response.json(metrics);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function fetchAddressMetrics(address, limit) {
  const response = await fetch(SOLANA_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params: [address, { limit: Math.min(limit, 50) }]
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`RPC Error: ${data.error.message}`);
  }

  const signatures = data.result || [];

  const metrics = {
    transactionCount: signatures.length,
    usdcVolume: 0,
    solVolume: 0
  };

  // Fetch detailed transaction data for volume calculation
  for (const sig of signatures.slice(0, Math.min(signatures.length, 20))) {
    try {
      const txResponse = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [
            sig.signature,
            { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }
          ]
        })
      });

      const txData = await txResponse.json();
      if (!txData.result) continue;

      const tx = txData.result;
      const meta = tx.meta;

      // Calculate SOL volume from balance changes
      const preBalances = meta.preBalances || [];
      const postBalances = meta.postBalances || [];
      const accountKeys = tx.transaction?.message?.accountKeys || [];

      for (let i = 0; i < accountKeys.length; i++) {
        const key = accountKeys[i].pubkey || accountKeys[i];
        if (key === address) {
          const diff = Math.abs((postBalances[i] || 0) - (preBalances[i] || 0));
          const sol = diff / 1e9;
          if (sol > 0.001) {
            metrics.solVolume += sol;
          }
        }
      }

      // Calculate USDC volume from token balance changes
      const preTokenBalances = meta.preTokenBalances || [];
      const postTokenBalances = meta.postTokenBalances || [];

      for (const post of postTokenBalances) {
        if (post.mint === USDC_MINT) {
          const pre = preTokenBalances.find(p => p.accountIndex === post.accountIndex);
          const preAmount = pre?.uiTokenAmount?.uiAmount || 0;
          const postAmount = post.uiTokenAmount?.uiAmount || 0;
          const diff = Math.abs(postAmount - preAmount);
          if (diff > 0.01) {
            metrics.usdcVolume += diff;
          }
        }
      }
    } catch (err) {
      console.error('Error fetching tx details:', err.message);
    }
  }

  return metrics;
}