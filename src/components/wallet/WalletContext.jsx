import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const WalletContext = createContext(null);

// USDC mint address on mainnet
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

export function WalletProvider({ children }) {
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletLabel, setWalletLabel] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [trackedWallets, setTrackedWallets] = useState([]);
  const [solPrice, setSolPrice] = useState(null);
  const [priceLastUpdated, setPriceLastUpdated] = useState(null);

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
    loadTrackedWallets();
    fetchSolPrice();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        setUserProfile(profiles[0]);
        if (profiles[0].connected_wallet) {
          setConnectedWallet(profiles[0].connected_wallet);
          setWalletLabel(profiles[0].wallet_label);
        }
      }
    } catch (err) {
      console.log('No profile yet:', err);
    }
  };

  const loadTrackedWallets = async () => {
    try {
      const user = await base44.auth.me();
      const wallets = await base44.entities.TrackedWallet.filter({ created_by: user.email });
      setTrackedWallets(wallets);
    } catch (err) {
      console.log('No tracked wallets:', err);
    }
  };

  const fetchSolPrice = async () => {
    try {
      // Use Jupiter Price API
      const response = await fetch(
        'https://price.jup.ag/v6/price?ids=SOL&vsToken=USDC'
      );
      const data = await response.json();
      if (data.data?.SOL?.price) {
        setSolPrice(data.data.SOL.price);
        setPriceLastUpdated(new Date());
      }
    } catch (err) {
      // Fallback to CoinGecko
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );
        const data = await response.json();
        if (data.solana?.usd) {
          setSolPrice(data.solana.usd);
          setPriceLastUpdated(new Date());
        }
      } catch (e) {
        console.error('Failed to fetch SOL price');
      }
    }
  };

  // Wallet Standard connection
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Browser-based wallet connection (Phantom, Solflare, etc.)
      // Production implementation would use:
      // - @solana/wallet-adapter-react for web
      // - @solana-mobile/mobile-wallet-adapter for MWA
      
      // For now, request user to manually select wallet from Connect page
      // In production: prompt with Wallet Standard selector dialog
      if (!window.solana && !window.phantom?.solana) {
        return { 
          success: false, 
          error: 'Please install a Solana wallet extension (Phantom, Solflare, etc.)'
        };
      }

      const wallet = window.solana || window.phantom?.solana;
      
      // Request connection with proper permissions
      const resp = await wallet.connect();
      const connectedAddress = resp.publicKey.toString();
      
      // Validate address server-side
      try {
        const validation = await fetch('/.netlify/functions/validateSolanaAddress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: connectedAddress })
        });
        
        if (!validation.ok) {
          throw new Error('Invalid Solana address');
        }
      } catch (err) {
        console.error('Address validation failed:', err);
      }

      // Save to profile
      let profile = userProfile;
      const walletName = wallet.name || 'Connected Wallet';
      
      if (!profile) {
        profile = await base44.entities.UserProfile.create({
          connected_wallet: connectedAddress,
          wallet_label: walletName,
          auth_provider: 'wallet'
        });
      } else {
        await base44.entities.UserProfile.update(profile.id, {
          connected_wallet: connectedAddress,
          wallet_label: walletName
        });
        profile = { ...profile, connected_wallet: connectedAddress, wallet_label: walletName };
      }
      
      setConnectedWallet(connectedAddress);
      setWalletLabel(walletName);
      setUserProfile(profile);
      
      return { success: true, address: connectedAddress };
    } catch (err) {
      console.error('Wallet connect error:', err);
      return { success: false, error: 'Wallet connection failed. Please ensure you have a Solana wallet installed.' };
    } finally {
      setIsConnecting(false);
    }
  }, [userProfile]);

  const disconnectWallet = useCallback(async () => {
    if (userProfile) {
      await base44.entities.UserProfile.update(userProfile.id, {
        connected_wallet: null,
        wallet_label: null
      });
      setUserProfile({ ...userProfile, connected_wallet: null, wallet_label: null });
    }
    setConnectedWallet(null);
    setWalletLabel(null);
  }, [userProfile]);

  const addTrackedWallet = useCallback(async (address, label) => {
    const wallet = await base44.entities.TrackedWallet.create({
      address,
      label: label || `Wallet ${trackedWallets.length + 1}`,
      is_connected_wallet: false,
      is_active: true
    });
    setTrackedWallets([...trackedWallets, wallet]);
    return wallet;
  }, [trackedWallets]);

  const removeTrackedWallet = useCallback(async (walletId) => {
    await base44.entities.TrackedWallet.delete(walletId);
    setTrackedWallets(trackedWallets.filter(w => w.id !== walletId));
  }, [trackedWallets]);

  const toggleWalletActive = useCallback(async (walletId) => {
    const wallet = trackedWallets.find(w => w.id === walletId);
    if (wallet) {
      await base44.entities.TrackedWallet.update(walletId, {
        is_active: !wallet.is_active
      });
      setTrackedWallets(trackedWallets.map(w => 
        w.id === walletId ? { ...w, is_active: !w.is_active } : w
      ));
    }
  }, [trackedWallets]);

  const getActiveWallets = useCallback(() => {
    const active = trackedWallets.filter(w => w.is_active);
    if (connectedWallet) {
      return [{ address: connectedWallet, label: walletLabel, is_connected_wallet: true }, ...active];
    }
    return active;
  }, [connectedWallet, walletLabel, trackedWallets]);

  const updateProfile = useCallback(async (data) => {
    if (userProfile) {
      await base44.entities.UserProfile.update(userProfile.id, data);
      setUserProfile({ ...userProfile, ...data });
    }
  }, [userProfile]);

  const value = {
    connectedWallet,
    walletLabel,
    isConnecting,
    userProfile,
    trackedWallets,
    solPrice,
    priceLastUpdated,
    connectWallet,
    disconnectWallet,
    addTrackedWallet,
    removeTrackedWallet,
    toggleWalletActive,
    getActiveWallets,
    updateProfile,
    loadTrackedWallets,
    fetchSolPrice,
    USDC_MINT
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    console.error('useWallet must be used within WalletProvider - check that Layout.jsx has WalletProvider');
    return {
      connectedWallet: null,
      walletLabel: null,
      isConnecting: false,
      userProfile: null,
      trackedWallets: [],
      solPrice: null,
      priceLastUpdated: null,
      connectWallet: async () => ({ success: false, error: 'Provider not initialized' }),
      disconnectWallet: async () => {},
      addTrackedWallet: async () => {},
      removeTrackedWallet: async () => {},
      toggleWalletActive: async () => {},
      getActiveWallets: () => [],
      updateProfile: async () => {},
      loadTrackedWallets: async () => {},
      fetchSolPrice: async () => {},
      USDC_MINT: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    };
  }
  return context;
}