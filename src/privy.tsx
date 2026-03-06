import type { ReactNode } from 'react'
import { PrivyProvider, type PrivyClientConfig } from '@privy-io/react-auth'
import { createSolanaRpc, createSolanaRpcSubscriptions, Rpc } from '@solana/kit'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'
import logoImage from '@/assets/logo.png'

const appId = (import.meta as any).env.VITE_PRIVY_APP_ID
const clientId = (import.meta as any).env.VITE_PRIVY_CLIENT_ID

const solanaRpcWSSMainnet = (import.meta as any).env
    .VITE_SOLANA_RPC_WSS_URL_MAINNET
const solanaRpcUrlMainnet = (import.meta as any).env.VITE_SOLANA_RPC_URL_MAINNET

const devnetRpc = createSolanaRpc('https://api.devnet.solana.com')
type SolanaTestClusterRpc = typeof devnetRpc

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
                rpc: devnetRpc,
                rpcSubscriptions: createSolanaRpcSubscriptions(
                    'wss://api.devnet.solana.com'
                ),
                blockExplorerUrl: 'https://explorer.solana.com',
            },
            'solana:mainnet': {
                rpc: createSolanaRpc(solanaRpcUrlMainnet) as SolanaTestClusterRpc,
                rpcSubscriptions:
                    createSolanaRpcSubscriptions(solanaRpcWSSMainnet),
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
