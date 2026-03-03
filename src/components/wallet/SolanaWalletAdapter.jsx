import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

import '@solana/wallet-adapter-react-ui/styles.css';

const network = WalletAdapterNetwork.MainnetBeta;

const RPC_ENDPOINT =
  import.meta.env.VITE_SOLANA_RPC ||
  'https://mainnet.helius-rpc.com/?api-key=9abceca9-8da1-4d53-ba5a-xcvwdsgfrsgf';

export default function SolanaWalletAdapter({ children }) {
  const wallets = useMemo(() => {
    try {
      return [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
      ];
    } catch (error) {
      console.error('Wallet adapter init failed', error);
      return [];
    }
  }, []);
  

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider
        wallets={wallets}
        autoConnect={false}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}