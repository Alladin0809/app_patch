import { useEffect, useState, useRef } from 'react'
import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth'
import type { User, Wallet } from '@privy-io/react-auth'
import type { ConnectedStandardSolanaWallet } from '@privy-io/react-auth/solana'
import { useWallets } from '@privy-io/react-auth/solana'

import { useWalletStore } from '@/store/wallet.store'

export type SignTransactionOutput = {
    signedTransaction: Uint8Array
}

import { apiGetSolBalance } from '@/service/api.js'
import { AnimatePresence, motion } from 'motion/react'
// ============================================================
// service & privy
// ==========================================================

/**
 * 解析 JWT token 获取过期时间
 * JWT 格式: header.payload.signature
 * payload 是 base64url 编码的 JSON，包含 exp 字段（过期时间戳）
 */
const parseTokenExpiration = (token: string): number | null => {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) {
            console.warn('Invalid JWT token format')
            return null
        }

        // 解析 payload（第二部分）
        const payload = parts[1]
        // base64url 解码：将 - 替换为 +，_ 替换为 /，并添加 padding
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
        const decoded = atob(padded)
        const claims = JSON.parse(decoded)
        console.log("parseTokenExpiration " + claims.exp + ", now:" + Math.floor(new Date().getTime() / 1000))

        // 返回过期时间戳（秒）
        return claims.exp || null
    } catch (error) {
        console.warn('Failed to parse token expiration:', error)
        return null
    }
}

/**
 * 检查 token 是否过期
 */
const isTokenExpired = (token: string): boolean => {
    const exp = parseTokenExpiration(token)
    if (!exp) {
        // 如果无法解析，认为 token 无效
        return true
    }

    // exp 是秒级时间戳，Date.now() 是毫秒级
    const currentTime = Math.floor(Date.now() / 1000)
    return exp < currentTime
}

export function WalletBootstrap() {
    const { user, authenticated, getAccessToken } = usePrivy()
    const { ready, wallets } = useWallets()
    // const [relogin, setRelogin] = useState(false)

    const [loginMethod, setLoginMethod] = useState<{
        type: string
        name: string
    } | null>(null)
    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
    const hasShownDialogRef = useRef(false)
    const setConnected = useWalletStore((s) => s.setConnected)
    const disconnect = useWalletStore((s) => s.disconnect)
    const setAccessToken = useWalletStore((s) => s.setAccessToken)
    const setBalance = useWalletStore((s) => s.setBalance)
    const setTokenBalance = useWalletStore((s) => s.setTokenBalance)
    const setUSDCBalance = useWalletStore((s) => s.setUSDCBalance)
    const setCurrentWallet = useWalletStore((s) => s.setWallet)
    const setTwitter = useWalletStore((s) => s.setTwitter)
    const setUserid = useWalletStore((s) => s.setUserid)
    const setTokenExpiration = useWalletStore((s) => s.setTokenExpiration)
    const address = useWalletStore((s) => s.address)
    const wallet = useWalletStore((s) => s.wallet)
    const connected = useWalletStore((s) => s.connected)
    const relogin = useWalletStore((s) => s.relogin)
    const setRelogin = useWalletStore((s) => s.setRelogin)

    const { linkTwitter, linkWallet, unlinkWallet } = usePrivy()

    const { logout } = useLogout({
        onSuccess: () => {
            disconnect()
            console.log('logout success')
        },
    })

    const { login } = useLogin({
        onComplete: (user) => {
            console.log(
                'login success loginMethod:' +
                user?.loginAccount?.type +
                ', isNewUser:' +
                user.isNewUser
            )
            if (user?.loginAccount?.type == 'wallet') {
                setLoginMethod({
                    type: 'wallet',
                    name: user.loginAccount?.address,
                })
                sessionStorage.setItem(user.user.id, user.loginAccount?.address)
            } else if (user?.loginAccount?.type == 'twitter_oauth') {
                setLoginMethod({
                    type: 'twitter_oauth',
                    name: user.loginAccount?.username,
                })
                sessionStorage.setItem(user.user.id, 'twitter_oauth')
            } else {
                //如果用户刷新页面，loginAccount=null，从本地存储获取上次信息
                let storeMethod = sessionStorage.getItem(user.user.id)
                if (storeMethod == 'twitter_oauth') {
                    setLoginMethod({
                        type: 'twitter_oauth',
                        name: 'twitter_oauth',
                    })
                } else if (storeMethod) {
                    setLoginMethod({ type: 'wallet', name: storeMethod })
                }
            }
            updateAccessToken()
        },

        onError: (error) => {
            logout()
            console.warn('login error:', error)
        },
    })

    const fixUserWallet = (
        user: User,
        wallets: ConnectedStandardSolanaWallet[]
    ): User => {
        const walletAccounts =
            user.linkedAccounts?.filter((item) => item.type === 'wallet') ?? []
        const solanaWalletAccounts =
            walletAccounts?.filter((item) => item.chainType === 'solana') ?? []

        //存在同一个钱包既是插件钱包，又是内部embedded钱包，所以1/2都是合法
        if (solanaWalletAccounts.length === 0) {
            console.log('account ' + JSON.stringify(walletAccounts))
            return null
        }

        wallets?.map((item, index) => {
            console.log(
                `Wallets Connected[${index}] Chains:${item.standardWallet.name} address: ${item.address}`
            )
        })

        //用户通过推特登录，则取第一个内部钱包
        if (!loginMethod || loginMethod.type == 'twitter_oauth') {
            const wallet = solanaWalletAccounts[0] as Wallet
            setCurrentWallet(
                wallets?.find((item) => item.address === wallet.address) ?? null
            )
            user.wallet = wallet
            console.log('fixUserWallet wallet:' + JSON.stringify(wallet) + ' loginMethod:' + JSON.stringify(loginMethod))
            return user
        } else if (loginMethod) {
            const wallet = solanaWalletAccounts?.find(
                (item) => item.address === loginMethod.name
            )
            console.log('fixUserWallet loginMethod wallet:' + JSON.stringify(wallet) + ' loginMethod:' + JSON.stringify(loginMethod))
            if (!wallet) {
                console.warn('fixUserWallet login wallet is null')
                return null
            }
            setCurrentWallet(
                wallets?.find((item) => item.address === loginMethod.name) ??
                null
            )
            user.wallet = wallet
            return user
        } else {
            console.warn('fixUserWallet wallet is null, loginMethod:' + JSON.stringify(loginMethod))
            return null
        }
    }

    const updateAccessToken = async () => {
        let token = await getAccessToken()

        //console.log('OAuth2 ' + token)
        if (token) {
            // 检查 token 是否过期
            if (isTokenExpired(token)) {
                console.warn('Token is expired, logging out...')
                logout()
                setTokenExpiration(true)
                return
            }

            setAccessToken(token)
        }
    }

    const updateTotalBalance = async (address: string | undefined) => {
        if (address) {
            apiGetSolBalance(address)
                .then((balance) => {
                    console.log('Your SOL balance:' + balance)
                    setBalance(balance)
                })
                .catch((error) => {
                    console.warn('Get SOL balance failed' + error)
                })
        }
    }

    // 连接钱包成功，初始化完成
    useEffect(() => {
        if (user == null) { //|| wallets.length == 0
            console.warn(
                `Connected wallets length: ${wallets?.length}, logined user is:${JSON.stringify(user)}`
            )
            return
        }

        console.log('user ' + JSON.stringify(user))
        let fixUser = fixUserWallet(user, wallets)

        if (!fixUser) {
            console.log('fixUser is null')
            return
        }

        setTwitter(fixUser?.twitter)
        setConnected(fixUser?.wallet?.address)
        updateTotalBalance(fixUser?.wallet?.address)
        setUserid(fixUser?.id)
        updateAccessToken()
        console.log(
            'Connected Successfully Address:' + fixUser?.wallet?.address +
            ' Userid:' + fixUser?.id
        )
    }, [wallets, user, loginMethod])

    // 定期检查 token 是否过期
    useEffect(() => {
        if (!authenticated) {
            return
        }

        // 每 30 秒检查一次 token 是否过期
        const checkInterval = setInterval(async () => {
            try {
                const token = await getAccessToken()
                //console.log("checkTokenExpiration " + token)
                if (token && isTokenExpired(token)) {
                    console.warn('Token expired during session, logging out...')
                    logout()
                    setTokenExpiration(true)
                }
                setAccessToken(token)
            } catch (error) {
                console.warn('Failed to check token expiration:', error)
            }
        }, 10000) // 30 秒检查一次

        return () => {
            clearInterval(checkInterval)
        }
    }, [authenticated, getAccessToken, logout])

    // 监听钱包连接状态：当 address 有值但 wallet 为 null 时，显示断开连接对话框
    useEffect(() => {

        console.log('useEffect ready:' + ready + ' authenticated:' + authenticated)

        if (ready && authenticated) {
            console.log('useEffect address:' + address + ' wallet:' + JSON.stringify(wallet))
            if (address && !wallet) {
                console.warn('useEffect hasShownDialogRef.current:' + hasShownDialogRef.current)
                // 只有当之前没有显示过对话框时才显示
                if (!hasShownDialogRef.current) {
                    setShowDisconnectDialog(true)
                    hasShownDialogRef.current = true
                }
            } else if (!address && wallet) {
                // 如果登陆态， address 被清空
                setShowDisconnectDialog(true)
                hasShownDialogRef.current = true
            } else {
                setShowDisconnectDialog(false)
                hasShownDialogRef.current = false
            }
        } else {
            setShowDisconnectDialog(false)
            hasShownDialogRef.current = false
        }

    }, [address, wallet, authenticated, ready])

    useEffect(() => {
        console.log('relogin useEffect relogin:' + relogin + ' ready:' + ready + ' authenticated:' + authenticated)
        if (relogin && ready && !authenticated) {
            console.warn('relogin useEffect login')
            login()
            setRelogin(false)
        }
    }, [relogin, authenticated, ready])

    const handleLogout = () => {
        logout()
        setRelogin(true)
        setShowDisconnectDialog(false)
        hasShownDialogRef.current = false
    }

    return (
        <>
            {showDisconnectDialog && (
                <AnimatePresence>
                    {(
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                                transition={{
                                    type: 'spring',
                                    damping: 20,
                                    stiffness: 300,
                                }}
                                className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header with Logo */}
                                <div className="flex flex-col items-center mb-6">
                                    <motion.div
                                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="mb-4"
                                    >

                                    </motion.div>
                                    <h2 className="text-2xl font-black text-gray-900 mb-1">
                                        钱包连接已断开
                                    </h2>
                                    <p className="text-gray-500 text-sm text-center">
                                        检测到您的钱包连接已断开，点击重新登陆。
                                    </p>
                                </div>

                                {/* CTA Button */}
                                <motion.button
                                    onClick={handleLogout}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black py-4 rounded-2xl text-base shadow-lg transition-all"
                                    whileTap={{ scale: 0.95 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    重新登陆
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </>
    )
}
