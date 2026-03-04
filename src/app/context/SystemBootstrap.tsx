import { useEffect } from 'react'
import { useSystemStore } from '@/store/sysInfo.store'
import { useWalletStore } from '@/store/wallet.store'
import { apiGetSystemInfo, apiGetTokenAccountsByOwner, apiGetUSDCHolding } from '@/service/api.js'
import { ErudaDebugger } from '@/utils/debug.ts'
// ============================================================
// service & privy
// ==========================================================
interface SystemProps {
    contractAddress: string
}

export function SystemBootstrap() {
    const sysInfoInit = useSystemStore((s) => s.init)
    const tokenAddress = useSystemStore((s) => s.tokenAddress)
    const address = useWalletStore((s) => s.address)
    const sysInfoUpdate = useSystemStore((s) => s.update)
    const setTokenBalance = useWalletStore((s) => s.setTokenBalance)
    const setUSDCBalance = useWalletStore((s) => s.setUSDCBalance)
    const setUpdate = useSystemStore((s) => s.setUpdate)

    async function updateSystemInfo() {
        try {
            let result = await apiGetSystemInfo()

            if (result == null || result.code != 200) {
                console.warn(
                    'updateSystemInfo result:' + JSON.stringify(result)
                )
                return null
            }

            sysInfoInit(result)
        } catch (error) {
            console.warn('updateSystemInfo error' + error)
        }
    }

    const updatePlatformToken = async (
        address: string | undefined,
        tokenAc: string | undefined
    ) => {
        try {
            if (!tokenAc) {
                console.warn('updatePlatformToken AC not Founds')
                return
            }

            if (!address) {
                console.warn('updatePlatformToken address null')
                return
            }

            let tokens = await apiGetTokenAccountsByOwner(address)
            let mobToken = tokens?.find((item) => item.mint == tokenAc)

            setTokenBalance(Math.floor(mobToken?.amount ?? 0))
            console.log(
                `PlatformToken[${tokenAc}] balance: ${mobToken?.amount ?? 0}`
            )
        } catch (error) {
            console.error(JSON.stringify(error))
        }
    }

    //只在初始化的时候，获取一次
    useEffect(() => {
        //console.log(' useEffect sysInfoUpdate ' + sysInfoUpdate)
        if (sysInfoUpdate) {
            updateSystemInfo()
        }
    }, [sysInfoUpdate])

    useEffect(() => {
        // const timer = setInterval(() => {
        //     updateSystemInfo()
        // }, 40000)
        // return () => clearInterval(timer)
    }, [address])

    //Debug模式判断
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search)
        const debugParam = queryParams?.get('debug') ?? 'false'
        if (debugParam === 'true') {
            ErudaDebugger()
        }

        setUpdate()
    }, [])

    //更新平台币地址
    useEffect(() => {
        updatePlatformToken(address, tokenAddress)
    }, [address, tokenAddress])

    useEffect(() => {
        updateUSDCBalance(address)
    }, [address])

    async function updateUSDCBalance(address: string | undefined) {
        try {
            if (!address) {
                console.warn('updateUSDCBalance address null')
                setUSDCBalance(0)
                return
            }

            const balance = await apiGetUSDCHolding(address)
            const usdcBalance = Math.floor(balance ?? 0)
            setUSDCBalance(usdcBalance)
            console.log(`USDC balance: ${usdcBalance}`)
        } catch (error) {
            console.error('updateUSDCBalance error:', error)
            setUSDCBalance(0)
        }
    }

    return null
}

