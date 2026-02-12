import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { base44 } from '@/api/base44Client';

const WalletContext = createContext(null);

// USDC mint address on Solana mainnet
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

export function WalletProvider({ children }) {
  const solanaWallet = useSolanaWallet();

  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletLabel, setWalletLabel] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [trackedWallets, setTrackedWallets] = useState([]);
  const [solPrice, setSolPrice] = useState(null);
  const [priceLastUpdated, setPriceLastUpdated] = useState(null);

  /* -------------------- INITIAL LOAD -------------------- */

  useEffect(() => {
    loadUserProfile();
    loadTrackedWallets();
    fetchSolPrice();
  }, []);

  /* -------------------- PROFILE -------------------- */

  const loadUserProfile = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({
        created_by: user.email,
      });

      if (profiles.length > 0) {
        const profile = profiles[0];
        setUserProfile(profile);

        if (profile.connected_wallet) {
          setConnectedWallet(profile.connected_wallet);
          setWalletLabel(profile.wallet_label);
        }
      }
    } catch (err) {
      console.info('No user profile found');
    }
  };

  /* -------------------- TRACKED WALLETS -------------------- */

  const loadTrackedWallets = async () => {
    try {
      const user = await base44.auth.me();
      const wallets = await base44.entities.TrackedWallet.filter({
        created_by: user.email,
      });
      setTrackedWallets(wallets);
    } catch (err) {
      console.info('No tracked wallets found');
    }
  };

  /* -------------------- SOL PRICE -------------------- */

  const fetchSolPrice = async () => {
    try {
      const response = await fetch(
        'https://price.jup.ag/v6/price?ids=SOL&vsToken=USDC'
      );
      const data = await response.json();

      if (data?.data?.SOL?.price) {
        setSolPrice(data.data.SOL.price);
        setPriceLastUpdated(new Date());
        return;
      }
    } catch {}

    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
      );
      const data = await response.json();

      if (data?.solana?.usd) {
        setSolPrice(data.solana.usd);
        setPriceLastUpdated(new Date());
      }
    } catch {
      console.error('Failed to fetch SOL price');
    }
  };

  /* -------------------- WALLET CONNECT -------------------- */

  const connectWallet = useCallback(async () => {
    if (!solanaWallet || !solanaWallet.connect) {
      return {
        success: false,
        error: 'No Solana wallet available',
      };
    }

    setIsConnecting(true);

    try {
      await solanaWallet.connect();

      if (!solanaWallet.publicKey) {
        throw new Error('Wallet connection failed');
      }

      const address = solanaWallet.publicKey.toString();
      const walletName = solanaWallet.wallet?.adapter?.name || 'Solana Wallet';

      let profile = userProfile;

      if (!profile) {
        profile = await base44.entities.UserProfile.create({
          connected_wallet: address,
          wallet_label: walletName,
          auth_provider: 'wallet',
        });
      } else {
        await base44.entities.UserProfile.update(profile.id, {
          connected_wallet: address,
          wallet_label: walletName,
        });
        profile = {
          ...profile,
          connected_wallet: address,
          wallet_label: walletName,
        };
      }

      setConnectedWallet(address);
      setWalletLabel(walletName);
      setUserProfile(profile);

      return { success: true, address };
    } catch (err) {
      console.error('Wallet connection error', err);
      return {
        success: false,
        error: 'Failed to connect wallet',
      };
    } finally {
      setIsConnecting(false);
    }
  }, [solanaWallet, userProfile]);

  /* -------------------- WALLET DISCONNECT -------------------- */

  const disconnectWallet = useCallback(async () => {
    try {
      await solanaWallet.disconnect();
    } catch {}

    if (userProfile) {
      await base44.entities.UserProfile.update(userProfile.id, {
        connected_wallet: null,
        wallet_label: null,
      });
      setUserProfile({
        ...userProfile,
        connected_wallet: null,
        wallet_label: null,
      });
    }

    setConnectedWallet(null);
    setWalletLabel(null);
  }, [solanaWallet, userProfile]);

  /* -------------------- TRACKED WALLET ACTIONS -------------------- */

  const addTrackedWallet = useCallback(
    async (address, label) => {
      const wallet = await base44.entities.TrackedWallet.create({
        address,
        label: label || `Wallet ${trackedWallets.length + 1}`,
        is_connected_wallet: false,
        is_active: true,
      });

      setTrackedWallets([...trackedWallets, wallet]);
      return wallet;
    },
    [trackedWallets]
  );

  const removeTrackedWallet = useCallback(
    async (walletId) => {
      await base44.entities.TrackedWallet.delete(walletId);
      setTrackedWallets(trackedWallets.filter((w) => w.id !== walletId));
    },
    [trackedWallets]
  );

  const toggleWalletActive = useCallback(
    async (walletId) => {
      const wallet = trackedWallets.find((w) => w.id === walletId);
      if (!wallet) return;

      await base44.entities.TrackedWallet.update(walletId, {
        is_active: !wallet.is_active,
      });

      setTrackedWallets(
        trackedWallets.map((w) =>
          w.id === walletId ? { ...w, is_active: !w.is_active } : w
        )
      );
    },
    [trackedWallets]
  );

  const getActiveWallets = useCallback(() => {
    const active = trackedWallets.filter((w) => w.is_active);
    if (connectedWallet) {
      return [
        {
          address: connectedWallet,
          label: walletLabel,
          is_connected_wallet: true,
        },
        ...active,
      ];
    }
    return active;
  }, [connectedWallet, walletLabel, trackedWallets]);

  /* -------------------- CONTEXT -------------------- */

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
    loadTrackedWallets,
    fetchSolPrice,
    USDC_MINT,
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
    throw new Error('useWallet must be used within WalletProvider');
  }

  return context;
}
