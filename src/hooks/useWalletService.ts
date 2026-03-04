import { useCallback } from 'react'
import {
    SolanaFundingConfig,
    useExportWallet,
    useFundWallet,
    useSignTransaction,
} from '@privy-io/react-auth/solana'
import { useWalletStore } from '@/store/wallet.store'

export const useWalletService = () => {
    const wallet = useWalletStore((s) => s.wallet)
    const { signTransaction } = useSignTransaction()
    const { fundWallet } = useFundWallet()
    const { exportWallet } = useExportWallet()

    const handleSignTransaction = useCallback(
        async (transaction: Uint8Array) => {
            if (wallet == null) {
                console.warn(
                    'signTransaction wallet: ' + JSON.stringify(wallet)
                )
                throw new Error('wallet empty')
            }

            console.log('signTransaction wallet: ' + JSON.stringify(wallet))

            const walletNet = import.meta.env?.VITE_WALLET_NET
            const network = walletNet === 'devnet' ? 'devnet' : 'mainnet'

            return await signTransaction({
                transaction: transaction,
                wallet: wallet,
                chain: 'solana:' + network,
                options: {
                    uiOptions: {
                        showWalletUIs: true,
                    },
                },
            })
        },
        [wallet, signTransaction]
    )

    const handleFundWallet = useCallback(
        async (options: SolanaFundingConfig | undefined) => {
            if (wallet == null) {
                console.warn('fundWallet: wallet empty')
                throw new Error('wallet empty')
            }
            return fundWallet({ address: wallet.address, options })
        },
        [wallet, fundWallet]
    )

    const handleExportWallet = useCallback(async () => {
        if (wallet == null) {
            console.warn('exportWallet: wallet empty')
            throw new Error('wallet empty')
        }
        return exportWallet({ address: wallet.address })
    }, [wallet, exportWallet])

    return { handleSignTransaction, handleFundWallet, handleExportWallet }
}
