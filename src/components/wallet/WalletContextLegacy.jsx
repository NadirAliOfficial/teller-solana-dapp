import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { base44 } from '@/api/base44Client';

const WalletContextLegacy = createContext(null);

export function WalletContextProvider({ children }) {
  const { publicKey, connected, disconnect, wallet } = useSolanaWallet();
  const { connection } = useConnection();
  const [userProfile, setUserProfile] = useState(null);
  const [trackedWallets, setTrackedWallets] = useState([]);
  const [solPrice, setSolPrice] = useState(null);
  const [priceLastUpdated, setPriceLastUpdated] = useState(null);

  // Load user profile on mount and when wallet connects
  useEffect(() => {
    loadUserProfile();
    loadTrackedWallets();
    fetchSolPrice();
  }, []);

  // Update profile when wallet connection changes
  useEffect(() => {
    if (connected && publicKey) {
      updateConnectedWallet(publicKey.toString(), wallet?.adapter.name);
    } else if (!connected) {
      clearConnectedWallet();
    }
  }, [connected, publicKey, wallet]);

  const loadUserProfile = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({
        created_by: user.email
      });
      if (profiles.length > 0) {
        setUserProfile(profiles[0]);
      }
    } catch (err) {
      console.log('No profile yet:', err);
    }
  };

  const loadTrackedWallets = async () => {
    try {
      const user = await base44.auth.me();
      const wallets = await base44.entities.TrackedWallet.filter({
        created_by: user.email
      });
      setTrackedWallets(wallets);
    } catch (err) {
      console.log('No tracked wallets:', err);
    }
  };

  const fetchSolPrice = async () => {
    try {
      const response = await fetch(
        'https://price.jup.ag/v6/price?ids=SOL&vsToken=USDC'
      );
      const data = await response.json();
      if (data.data?.SOL?.price) {
        setSolPrice(data.data.SOL.price);
        setPriceLastUpdated(new Date());
      }
    } catch (err) {
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

  const updateConnectedWallet = useCallback(
    async (address, walletName) => {
      try {
        let profile = userProfile;
        if (!profile) {
          profile = await base44.entities.UserProfile.create({
            connected_wallet: address,
            wallet_label: walletName || 'Connected Wallet',
            auth_provider: 'wallet'
          });
        } else {
          await base44.entities.UserProfile.update(profile.id, {
            connected_wallet: address,
            wallet_label: walletName || 'Connected Wallet'
          });
          profile = {
            ...profile,
            connected_wallet: address,
            wallet_label: walletName || 'Connected Wallet'
          };
        }
        setUserProfile(profile);
      } catch (err) {
        console.error('Failed to update wallet in profile:', err);
      }
    },
    [userProfile]
  );

  const clearConnectedWallet = useCallback(async () => {
    try {
      if (userProfile) {
        await base44.entities.UserProfile.update(userProfile.id, {
          connected_wallet: null,
          wallet_label: null
        });
        setUserProfile({
          ...userProfile,
          connected_wallet: null,
          wallet_label: null
        });
      }
    } catch (err) {
      console.error('Failed to clear wallet from profile:', err);
    }
  }, [userProfile]);

  const handleDisconnect = useCallback(async () => {
    try {
      await clearConnectedWallet();
      await disconnect();
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  }, [clearConnectedWallet, disconnect]);

  const addTrackedWallet = useCallback(
    async (address, label) => {
      try {
        // Validate address
        new PublicKey(address);

        const wallet = await base44.entities.TrackedWallet.create({
          address,
          label: label || `Wallet ${trackedWallets.length + 1}`,
          is_connected_wallet: false,
          is_active: true
        });
        setTrackedWallets([...trackedWallets, wallet]);
        return wallet;
      } catch (err) {
        throw new Error('Invalid Solana address');
      }
    },
    [trackedWallets]
  );

  const removeTrackedWallet = useCallback(
    async (walletId) => {
      try {
        await base44.entities.TrackedWallet.delete(walletId);
        setTrackedWallets(trackedWallets.filter(w => w.id !== walletId));
      } catch (err) {
        console.error('Failed to remove wallet:', err);
      }
    },
    [trackedWallets]
  );

  const toggleWalletActive = useCallback(
    async (walletId) => {
      const wallet = trackedWallets.find(w => w.id === walletId);
      if (wallet) {
        try {
          await base44.entities.TrackedWallet.update(walletId, {
            is_active: !wallet.is_active
          });
          setTrackedWallets(
            trackedWallets.map(w =>
              w.id === walletId ? { ...w, is_active: !w.is_active } : w
            )
          );
        } catch (err) {
          console.error('Failed to toggle wallet active:', err);
        }
      }
    },
    [trackedWallets]
  );

  const getActiveWallets = useCallback(() => {
    const active = trackedWallets.filter(w => w.is_active);
    if (connected && publicKey && userProfile?.connected_wallet) {
      return [
        {
          address: publicKey.toString(),
          label: userProfile.wallet_label || 'Connected Wallet',
          is_connected_wallet: true
        },
        ...active
      ];
    }
    return active;
  }, [connected, publicKey, trackedWallets, userProfile]);

  const updateProfile = useCallback(
    async (data) => {
      if (userProfile) {
        try {
          await base44.entities.UserProfile.update(userProfile.id, data);
          setUserProfile({ ...userProfile, ...data });
        } catch (err) {
          console.error('Failed to update profile:', err);
        }
      }
    },
    [userProfile]
  );

  const value = {
    // Wallet adapter hooks
    connected,
    publicKey,
    wallet,
    disconnect: handleDisconnect,

    // Legacy API for backward compatibility
    connectedWallet: publicKey?.toString() || null,
    walletLabel: userProfile?.wallet_label || null,
    isConnecting: false,
    userProfile,
    trackedWallets,
    solPrice,
    priceLastUpdated,

    // Methods
    connectWallet: async () => {
      return {
        success: true,
        address: publicKey?.toString() || null
      };
    },
    disconnectWallet: handleDisconnect,
    addTrackedWallet,
    removeTrackedWallet,
    toggleWalletActive,
    getActiveWallets,
    updateProfile,
    loadTrackedWallets,
    fetchSolPrice,
    USDC_MINT: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  };

  return (
    <WalletContextLegacy.Provider value={value}>
      {children}
    </WalletContextLegacy.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContextLegacy);
  if (!context) {
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