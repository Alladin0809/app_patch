import { create } from "zustand";
import type { ConnectedStandardSolanaWallet } from "@privy-io/react-auth/solana"
import type { Twitter } from "@privy-io/react-auth"

type WalletState = {
    connected: boolean;
    address?: string;
    token?: string;
    balance: number;
    tokenBalance: number;
    usdcBalance: number;
    wallet: ConnectedStandardSolanaWallet | null;
    twitter: Twitter | null;
    userid: string;
    tokenExpiration: boolean;
    relogin: boolean;
    setBalance: (balance: number) => void;
    setUSDCBalance: (balance: number) => void;
    setAccessToken: (token?: string) => void;
    setConnected: (addr?: string) => void;
    disconnect: () => void;
    setTokenBalance: (balance: number) => void;
    setWallet: (wallet: ConnectedStandardSolanaWallet) => void;
    setTwitter: (twitter: Twitter) => void;
    setUserid: (userid: string) => void;
    setTokenExpiration: (expiration: boolean) => void;
    setRelogin: (relogin: boolean) => void;

};

export const useWalletStore = create<WalletState>((set) => ({
    connected: false,
    address: undefined,
    token: undefined,
    balance: 0,
    tokenBalance: 0,
    usdcBalance: 0,
    wallet: null,
    twitter: null,
    userid: '',
    tokenExpiration: false,
    relogin: false,

    setConnected(address) {
        set({
            connected: !!address,
            address,
        });
    },

    disconnect() {
        set({
            connected: false,
            address: undefined,
            token: undefined,
            balance: 0,
            tokenBalance: 0,
            usdcBalance: 0,
            wallet: null,
            twitter: null,
        });
    },

    setAccessToken(token) {
        set({
            token,
        });
    },

    setBalance(balance) {
        set({
            balance,
        });
    },

    setTokenBalance(balance) {
        set({
            tokenBalance: balance,
        });
    },

    setUSDCBalance(balance) {
        set({
            usdcBalance: balance,
        });
    },

    setWallet(wallet) {
        set({
            wallet,
        });
    },

    setTwitter(twitter: Twitter) {
        console.log("twitter:" + JSON.stringify(twitter))
        if (!twitter) {
            return
        }

        twitter.profilePictureUrl = twitter?.profilePictureUrl?.replace('_normal', '_400x400'),
            set({
                twitter,
            });
    },

    setUserid(userid: string) {
        set({
            userid,
        });
    },
    setTokenExpiration(expiration: boolean) {
        set({
            tokenExpiration: expiration,
        });
    },

    setRelogin(relogin: boolean) {
        set({
            relogin,
        });
    },
}));
