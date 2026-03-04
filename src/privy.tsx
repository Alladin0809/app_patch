import type { ReactNode } from 'react'
import { PrivyProvider, type PrivyClientConfig } from '@privy-io/react-auth'
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'
import logoImage from '@/assets/logo.png'

const appId = (import.meta as any).env.VITE_PRIVY_APP_ID
const clientId = (import.meta as any).env.VITE_PRIVY_CLIENT_ID

const privyConfig = {
  loginMethods: ['wallet'] as const,
  appearance: {
    showWalletLoginFirst: true,
    walletChainType: 'solana-only' as const,
    walletList: ['okx_wallet', 'detected_wallets', 'phantom', 'solflare'],
    theme: 'light' as const,
    accentColor: '#00d063' as `#${string}`,
    logo: logoImage,
  },
  solana: {
    rpcs: {
      'solana:devnet': {
        rpc: createSolanaRpc('https://api.devnet.solana.com'),
        rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.devnet.solana.com'),
        blockExplorerUrl: 'https://explorer.solana.com',
      },
      'solana:mainnet': {
        rpc: createSolanaRpc(
          'https://mainnet.helius-rpc.com/?api-key=44b4b836-dd22-43da-9abe-84ccb07a015f'
        ),
        rpcSubscriptions: createSolanaRpcSubscriptions(
          'wss://mainnet.helius-rpc.com/?api-key=44b4b836-dd22-43da-9abe-84ccb07a015f'
        ),
        blockExplorerUrl: 'https://explorer.solana.com',
      },
    },
  },
  externalWallets: {
    solana: {
      connectors: toSolanaWalletConnectors(),
    },
  },
  embeddedWallets: {
    solana: {
      createOnLogin: 'users-without-wallets' as const,
    },
    showWalletUIs: true,
  },
} satisfies PrivyClientConfig

export function PrivyRoot({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider appId={appId} clientId={clientId} config={privyConfig}>
      {children}
    </PrivyProvider>
  )
}
