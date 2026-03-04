import { JSON2IPFSURL } from '@/service/lib.upload.js'
import { formatHash4 } from '@/service/utils/helpers.js'
import { useWalletStore } from '@/store/wallet.store'

import { useWalletService } from '@/hooks/useWalletService'
import { apiProductCreate, apiClaimToken } from '@/service/api.js'

import libmeteora from '@/service/web3/lib.meteora.js'

const MIN_BALANCE_REQUIRE = 0

type ToastFn = (text: string, type: string) => void

type CreateProc = {
    formatMeta: () => Record<string, unknown>
    formatParams: () => Record<string, unknown>
    onToast: ToastFn
    autoLaunch?: boolean
    extension?: boolean
}

type ClaimProc = {
    mint: string
    onToast: ToastFn
}

export const useDeployService = () => {
    const solBalance = useWalletStore((s) => s.balance)
    const privyToken = useWalletStore((s) => s.token)
    const wallet = useWalletStore((s) => s.wallet)
    const address = useWalletStore((s) => s.address)
    const { handleSignTransaction } = useWalletService()

    //platform token
    const handleCreateToken = async ({
        formatMeta,
        formatParams,
        onToast,
    }: CreateProc) => {
        if (!formatMeta || !formatParams) {
            onToast('Parameters error.', 'error')
            return null
        }

        if (solBalance < MIN_BALANCE_REQUIRE) {
            onToast('The wallet balance is insufficient.', 'error')
            return null
        }

        if (!privyToken) {
            onToast('The privyToken is empty, wallet is disconnected.', 'error')
            return null
        }

        let urlHash = await JSON2IPFSURL(formatMeta())
        if (!urlHash) {
            onToast('IPFS failure. Please try again later.', 'error')
            return null
        }

        let params = formatParams()
        if (!params) {
            onToast('Format parameters failure.', 'error')
            return null
        }

        params = { ...params, ipfs_url: urlHash }

        try {
            let result = await apiPlatformMobCreate(privyToken, params)
            if (result && result?.base64_transaction) {
                let base64Tranx = result?.base64_transaction
                let base64 = await libmeteora.sign_base64(
                    handleSignTransaction,
                    wallet,
                    base64Tranx
                )

                if (base64 == null || base64?.length == 0) {
                    onToast('Signature failed', 'error')
                } else {
                    let res = await apiPlatformMobCreateEx(privyToken, {
                        mint: result?.mint,
                        base64_transaction: base64,
                    })
                    onToast(
                        `Token [${formatHash4(
                            result?.mint
                        )}] created successfully.`,
                        'success'
                    )
                    return result?.mint
                }
            } else {
                console.warn('handleCreateToken:' + JSON.stringify(result))
                onToast(JSON.stringify(result), 'error')
            }
        } catch (error: unknown) {
            console.warn('handleCreateToken failed', error)
            const msg =
                (error as { status?: number; data?: { message?: string } })
                    ?.data?.message ??
                (error as { message?: string })?.message ??
                'Network error'
            onToast(msg, 'error')
        }

        return null
    }

    const handleCreateProduct = async ({
        formatMeta,
        formatParams,
        onToast,
        autoLaunch,
        extension,
    }: CreateProc) => {
        if (!formatMeta || !formatParams) {
            onToast('Parameters error.', 'error')
            return null
        }

        if (solBalance < MIN_BALANCE_REQUIRE) {
            onToast('The wallet balance is insufficient.', 'error')
            return null
        }

        if (!privyToken) {
            onToast('The privyToken is empty, wallet is disconnected.', 'error')
            return null
        }

        let urlHash = await JSON2IPFSURL(formatMeta())
        if (!urlHash) {
            onToast('IPFS failure. Please try again later.', 'error')
            return null
        }

        let params = formatParams()
        if (!params) {
            onToast('Format parameters failure.', 'error')
            return null
        }

        params = { ...params, ipfs_url: urlHash }

        try {
            console.log(
                `handleCreateProduct autoLaunch:${autoLaunch}, extension:${extension}`
            )

            let result = await apiProductCreate(privyToken, params)
            console.log('handleCreateProduct result:' + JSON.stringify(result))
            if (result == null || result.code !== 200) {
                onToast('Create product failed', 'error')
                return null
            }

            //只发链上
            if (autoLaunch && result && result?.tx_base64) {
                let base64Tranx = result?.tx_base64
                let signature = await libmeteora.send_base64Tranx(
                    handleSignTransaction,
                    base64Tranx
                )
                console.log('send_base64Tranx  signature return:' + signature)
                if (signature == null || signature?.length == 0) {
                    onToast('send_base64Tranx failed', 'error')
                    return null
                } else {
                    return result?.product
                }
            }

            if (result && result?.tx_base64) {
                let base64Tranx = result?.tx_base64
                let signature = await libmeteora.sign_base64Tranx(
                    handleSignTransaction,
                    wallet,
                    base64Tranx
                )

                console.log('sign_base64Tranx  signature return:' + signature)
                if (signature == null || signature?.length == 0) {
                    onToast('Signature failed', 'error')
                } else {
                    return result?.product
                }
            } else {
                console.warn(
                    'apiProductCreate  result fail: ' + JSON.stringify(result)
                )
                onToast(
                    `Code:${result?.code}, message: ${result?.message}`,
                    'error'
                )
            }
        } catch (error) {
            console.error('apiProductCreate error:' + error)
            throw error
        }

        return null
    }

    const handleCreateClient = async ({
        formatMeta,
        formatParams,
        onToast,
    }: CreateProc) => {
        const config = 'EHo4EHDKg4hR76r9R5hoUzbgpxYxuNy48u9h5HWwz2H9' //for devnet
        //const config = 'EzCq2XgJaeGSNwt4Jr4AoeeG4AV1Af1GtkrLZcd19KBE' //for mainnet
        //get_pool_config("49qnhsbgCp5G1K8LfDPV4uDi5eZ2aDtgwrj7kbWECLWj")

        if (!formatMeta || !formatParams) {
            onToast('Parameters error.', 'error')
            return null
        }

        if (solBalance < MIN_BALANCE_REQUIRE) {
            onToast('The wallet balance is insufficient.', 'error')
            return null
        }

        if (!privyToken) {
            onToast('The privyToken is empty, wallet is disconnected.', 'error')
            return null
        }

        let urlHash = await JSON2IPFSURL(formatMeta())
        if (!urlHash) {
            onToast('IPFS failure. Please try again later.', 'error')
            return null
        }

        let params = formatParams()
        if (!params) {
            onToast('Format parameters failure.', 'error')
            return null
        }

        params = { ...params, uri: urlHash }

        try {
            console.log('onCreateToken ' + JSON.stringify(params))
            //let result = await libmeteora.create_dbc_pool (config, params)
            let result2 = await libmeteora.get_pool_config(
                '5nCMT46SLrZpeUAGzDAN9ujPoaXUUXVXBvM2wP8TApFA'
            )

            console.log(JSON.stringify(result2))

            let result = await libmeteora.create_dbc_pool(
                handleSignTransaction,
                wallet,
                config,
                params
            )
            console.log('onCreateToken signature:' + result)
            return result
        } catch (error) {
            console.warn(JSON.stringify(error))
            throw error
        }
    }

    const handleClaim = async ({ mint, onToast }: ClaimProc) => {
        try {
            const params = { wallet: address, mint }
            const result = await apiClaimToken(privyToken, params)
            if (result == null || result.balance === undefined) {
                const msg = result?.message
                    ? `Code:${result.code}, message: ${result.message}`
                    : 'Token claim failed'
                onToast(msg, 'error')
                return false
            }

            if (result.tx_base64) {
                let signature = await libmeteora.sign_base64Tranx(
                    handleSignTransaction,
                    wallet,
                    result.tx_base64
                )
                console.log('sign_base64Tranx  signature return:' + signature)
                if (signature == null || signature?.length == 0) {
                    onToast('Signature failed', 'error')
                } else {
                    onToast(`Token claimed successfully`, 'success')
                    return true
                }
            } else {
                onToast(`Token claimed successfully`, 'success')
                return true
            }
        } catch (error: unknown) {
            console.warn('handleClaim failed', error)
            const data = (
                error as { data?: { code?: number; message?: string } }
            )?.data
            onToast(
                data
                    ? `Code:${data.code}, message: ${data.message}`
                    : 'Token claim failed (network error)',
                'error'
            )
        }
        return false
    }

    return {
        handleCreateToken,
        handleCreateClient,
        handleCreateProduct,
        handleClaim,
    }
}
