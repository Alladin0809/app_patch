import { useQuery } from '@tanstack/react-query'
import { fetchBalance, fetchTokenBalance } from '@/hooks/balance.service'
import { useWalletStore } from '@/store/wallet.store'

export const useBalance = () => {
    const address = useWalletStore((s) => s.address)
    return useQuery({
        queryKey: ['balance', address ?? ''],
        queryFn: () => fetchBalance(address!),
        enabled: !!address,
        refetchInterval: 2_000,
    })
}

export const useTokenBalance = (tokenAccountOrMint: string) => {
    const address = useWalletStore((s) => s.address)
    return useQuery({
        queryKey: ['tokenBalance', address ?? '', tokenAccountOrMint],
        queryFn: () => fetchTokenBalance(address!, tokenAccountOrMint),
        enabled: !!address && !!tokenAccountOrMint,
        refetchInterval: 60_000,
    })
}

