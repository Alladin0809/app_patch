import {
    apiGetSolBalance,
    apiGetTokenAccountsByOwner,
} from '@/service/api.js'

export async function fetchBalance(address: string): Promise<number> {
    try {
        if (!address) {
            return 0
        }
        const balance = await apiGetSolBalance(address)
        return balance ?? 0
    } catch (error) {
        console.warn('fetchBalance failed', error)
        return 0
    }
}

export async function fetchTokenBalance(
    address: string,
    tokenMintOrAccount: string
): Promise<number> {
    try {
        if (!address || !tokenMintOrAccount) {
            return 0
        }
        const tokens = await apiGetTokenAccountsByOwner(address)
        const token = tokens?.find(
            (item) => item.mint === tokenMintOrAccount
        )
        return token?.amount ?? 0
    } catch (error) {
        console.warn('fetchTokenBalance failed', error)
        return 0
    }
}


