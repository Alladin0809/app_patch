'use strict'
import { Buffer } from 'buffer'
window.Buffer = Buffer
import { sendAndConfirmTransaction } from '@solana/web3.js'
import {
    DynamicBondingCurveClient,
    ActivationType,
} from '@meteora-ag/dynamic-bonding-curve-sdk'
import { CpAmm, getTokenProgram } from '@meteora-ag/cp-amm-sdk'

import {
    Connection,
    Transaction,
    Keypair,
    PublicKey,
    clusterApiUrl,
    VersionedTransaction,
} from '@solana/web3.js'
import { getMint } from '@solana/spl-token'
import BN from 'bn.js'
import bs58 from 'bs58'

import {
    useSignTransaction,
    useSignAndSendTransaction,
} from '@privy-io/react-auth/solana'
// import { Wallet } from 'lucide-react';
//const { signTransaction } = useSignTransaction()
const { signAndSendTransaction } = useSignAndSendTransaction()

const uri = import.meta.env.VITE_SOLSCAN_RPC
    ? import.meta.env.VITE_SOLSCAN_RPC
    : clusterApiUrl(import.meta.env.VITE_WALLET_NET)

//qa-task/config.json5/solana/platform/creator_private_key;partner_private_key
let dbcPoolCreator = new PublicKey(
    'Bm5kGfQhXXst8zSFS8DieYuXCxXDwkJbsXSFHT1aPreQ'
)
//let dbcPoolCreator = new PublicKey("EHo4EHDKg4hR76r9R5hoUzbgpxYxuNy48u9h5HWwz2H9");
//const dbcPoolCreator = new PublicKey('CyfU5s8jbTAByQB5wqqW961ZnaezigBhDL9bcW7xvTZe');
// const dbcPoolCreator = new PublicKey('14XAxdd8mzwYK74qVymb6daBp1fRPVVP9k1dv7GStsP3');

function init_config_key(key) {
    // if (key) {
    //     dbcPoolCreator = new PublicKey(key)
    // }
}

async function getPoolByBaseMint(cpAmm, baseMint) {
    const filters = [
        {
            memcmp: {
                offset: 168,
                bytes: baseMint.toBase58(),
                encoding: 'base58',
            },
        },
    ]

    const pools = await cpAmm._program.account.pool.all(filters)
    const positions = await cpAmm.getPositionsByUser(dbcPoolCreator)

    if (positions.length == 0 && pools.length > 0) {
        console.warn('pools ' + JSON.stringify(pools))
        console.warn('positions ' + JSON.stringify(positions))
        return pools[0]
    }

    const matchedPool = pools.find((pool) =>
        positions.some((position) =>
            pool.publicKey.equals(position.positionState.pool)
        )
    )
    return matchedPool || null
}

async function getCurrentPoint(connection, activationType) {
    const currentSlot = await connection.getSlot()
    if (activationType === ActivationType.Slot) {
        return new BN(currentSlot)
    } else {
        const currentTime = await connection.getBlockTime(currentSlot)
        return new BN(currentTime)
    }
}

export async function pre_buy_tokens(mint, amount_in, slippage_bps) {
    try {
        // mint = "FQMahVWHmRT6bqdDsZgP1jGKX3ksh7JDiR9Z9sEUrYpd";
        mint = new PublicKey(mint)
        const connection = new Connection(uri, 'confirmed')
        const client = new DynamicBondingCurveClient(connection, 'confirmed')
        const virtualPoolState = await client.state.getPoolByBaseMint(mint)

        console.log('mint ' + JSON.stringify(mint))
        if (!virtualPoolState) {
            console.log('virtualPoolState ' + JSON.stringify(virtualPoolState))
            return
        }

        let amountOut = new BN(0)
        switch (virtualPoolState?.account?.isMigrated ?? 1) {
            case 0:
                const poolConfigState = await client.state.getPoolConfig(
                    virtualPoolState.account.config
                )

                const currentPoint = await getCurrentPoint(
                    connection,
                    poolConfigState.activationType
                )

                const { minimumAmountOut } = client.pool.swapQuote({
                    virtualPool: virtualPoolState.account,
                    config: poolConfigState,
                    swapBaseForQuote: false,
                    amountIn: new BN(
                        Number(amount_in) * 10 ** poolConfigState.tokenDecimal
                    ),
                    slippageBps: slippage_bps,
                    hasReferral: false,
                    currentPoint,
                })
                amountOut = minimumAmountOut
                break
            case 1:
                slippage_bps = slippage_bps / 100
                const cpAmm = new CpAmm(connection)
                const pool = await getPoolByBaseMint(cpAmm, mint)
                if (!pool) {
                    throw new Error('pool not found')
                }

                const [mintAInfo, mintBInfo, currentSlot] = await Promise.all([
                    getMint(connection, pool.account.tokenAMint),
                    getMint(connection, mint),
                    connection.getSlot(),
                ])

                const blockTime = await connection.getBlockTime(currentSlot)

                const { minSwapOutAmount } = cpAmm.getQuote({
                    inAmount: new BN(
                        Number(amount_in) * 10 ** mintBInfo.decimals
                    ),
                    inputTokenMint: mint,
                    slippage: slippage_bps,
                    poolState: pool.account,
                    currentTime: blockTime,
                    currentSlot,
                    tokenADecimal: mintAInfo.decimals,
                    tokenBDecimal: mintBInfo.decimals,
                })
                amountOut = minSwapOutAmount
                break
        }

        return amountOut.toString()
    } catch (error) {
        console.warn('pre_buy_tokens failed:', error)
        return '0'
    }
}

async function manualMigrate(signTransaction, mint, wallet) {
    if (!signTransaction) {
        console.warn(' buy_tokens signTransaction:' + signTransaction)
        return
    }

    try {
        // 1. 获取池子状态，确认是否达到阈值
        const walletPublicKey = new PublicKey(wallet.address)
        const connection = new Connection(uri, 'confirmed')
        const client = new DynamicBondingCurveClient(connection, 'confirmed')
        const virtualPoolState = await client.state.getPoolByBaseMint(mint)

        // 2. 准备迁移交易
        // 注意：迁移涉及大量账户，通常需要 Version 0 (V0) 交易和 LUT (Address Lookup Table)
        let swapIx = await client.migration.migrateToDammV2({
            payer: walletPublicKey,
            virtualPool: new PublicKey(virtualPoolState.publicKey),
            dammConfig: new PublicKey(
                '8rgJebAvGwGbcKk9HSJqgtm3nkrSH7mziSN2wPSSfi9z'
            ),
        })

        let tx = new Transaction().add(swapIx)
        tx.feePayer = walletPublicKey
        const { blockhash: recentBlockhash } =
            await connection.getLatestBlockhash()
        tx.recentBlockhash = recentBlockhash

        // 3. 发送交易
        const signedTx = await signTransaction(
            tx.serialize({ requireAllSignatures: false })
        )
        const signature = await connection.sendRawTransaction(
            signedTx.signedTransaction,
            {
                skipPreflight: false,
                preflightCommitment: 'confirmed',
            }
        )

        console.log('迁移完成:', JSON.stringify(signature))
    } catch (error) {
        console.warn('迁移完成 failed:', error)
        throw error
    }
}

export async function buy_tokens(
    signTransaction,
    wallet,
    mint,
    amount_in,
    slippage_bps
) {
    try {
        // mint = "FQMahVWHmRT6bqdDsZgP1jGKX3ksh7JDiR9Z9sEUrYpd";
        console.warn('buy_tokens mint:' + mint)
        console.warn('buy_tokens amount_in:' + amount_in)
        console.warn('buy_tokens slippage_bps:' + slippage_bps)
        mint = new PublicKey(mint)

        if (!signTransaction) {
            console.warn(' buy_tokens signTransaction:' + signTransaction)
            return
        }

        const walletPublicKey = new PublicKey(wallet.address)
        const connection = new Connection(uri, 'confirmed')
        const client = new DynamicBondingCurveClient(connection, 'confirmed')

        const virtualPoolState = await client.state.getPoolByBaseMint(mint)

        let swapIx = null

        console.warn('buy_tokens virtualPoolState.account.isMigrated:' + virtualPoolState?.account?.isMigrated)

        switch (virtualPoolState?.account?.isMigrated ?? 1) {
            case 0:
                const poolConfigState = await client.state.getPoolConfig(
                    virtualPoolState.account.config
                )

                console.warn('buy_tokens dbc swap')
                const currentPoint = await getCurrentPoint(
                    connection,
                    poolConfigState.activationType
                )

                const { minimumAmountOut } = client.pool.swapQuote({
                    virtualPool: virtualPoolState.account,
                    config: poolConfigState,
                    swapBaseForQuote: false,
                    amountIn: new BN(
                        Number(amount_in) * 10 ** poolConfigState.tokenDecimal
                    ),
                    slippageBps: slippage_bps,
                    hasReferral: false,
                    currentPoint,
                })

                const poolAddress = new PublicKey(virtualPoolState.publicKey)

                console.warn('Pool ' + virtualPoolState.publicKey)
                console.warn(
                    'Migration ' +
                    (await client.state.getPoolMigrationQuoteThreshold(
                        poolAddress
                    ))
                )
                console.warn(
                    'progress ' +
                    (await client.state.getPoolCurveProgress(poolAddress))
                )
                console.warn(
                    'amount ' +
                    new BN(
                        Number(amount_in) *
                        10 ** poolConfigState.tokenDecimal
                    ).toString()
                )
                console.warn(
                    'minimumAmountOut ' + minimumAmountOut.toString() / 1e9
                )

                swapIx = await client.pool.swap({
                    owner: walletPublicKey,
                    amountIn: new BN(
                        Number(amount_in) * 10 ** poolConfigState.tokenDecimal
                    ),
                    minimumAmountOut: minimumAmountOut,
                    swapBaseForQuote: false,
                    pool: virtualPoolState.publicKey,
                    referralTokenAccount: null,
                    payer: walletPublicKey,
                })

                break

            case 1:
                console.warn('buy_tokens dammv2 swap')
                slippage_bps = slippage_bps / 100
                const cpAmm = new CpAmm(connection)
                const pool = await getPoolByBaseMint(cpAmm, mint)
                if (!pool) {
                    throw new Error('pool not found')
                }

                const [mintAInfo, mintBInfo, currentSlot] = await Promise.all([
                    getMint(connection, pool.account.tokenAMint),
                    getMint(connection, mint),
                    connection.getSlot(),
                ])


                console.log('buy_tokens mintAInfo:' + mintAInfo.address)
                console.log('buy_tokens decimals:' + mintAInfo.decimals)
                console.log('buy_tokens mintBInfo:' + mintBInfo.address)
                console.log('buy_tokens decimals:' + mintBInfo.decimals)
                console.log('buy_tokens amount_in:' + amount_in)
                console.log('buy_tokens mint:' + mint.toBase58())
                console.log('buy_tokens currentSlot:' + currentSlot)
                console.log('buy_tokens slippage_bps:' + slippage_bps)
                const blockTime = await connection.getBlockTime(currentSlot || 0)

                let minSwapOutAmount = new BN(
                    Number(amount_in) * 10 ** mintBInfo.decimals
                ).mul(new BN(10000 - slippage_bps)).div(new BN(10000))

                try {
                    minSwapOutAmount = await cpAmm.getQuote({
                        inAmount: new BN(
                            Number(amount_in) * 10 ** mintBInfo.decimals
                        ),
                        inputTokenMint: mint,
                        slippage: slippage_bps,
                        poolState: pool.account,
                        currentTime: blockTime,
                        currentSlot,
                        tokenADecimal: mintAInfo.decimals,
                        tokenBDecimal: mintBInfo.decimals,
                    })
                }
                catch (error) {
                    console.warn('buy_tokens getQuote failed:', error)
                }

                swapIx = await cpAmm.swap({
                    payer: walletPublicKey,
                    pool: pool.publicKey,
                    inputTokenMint: pool.account.tokenBMint,
                    outputTokenMint: pool.account.tokenAMint,
                    amountIn: new BN(
                        Number(amount_in) * 10 ** mintBInfo.decimals
                    ),
                    minimumAmountOut: minSwapOutAmount,
                    tokenAMint: pool.account.tokenAMint,
                    tokenBMint: pool.account.tokenBMint,
                    tokenAVault: pool.account.tokenAVault,
                    tokenBVault: pool.account.tokenBVault,
                    tokenAProgram: getTokenProgram(pool.account.tokenAFlag),
                    tokenBProgram: getTokenProgram(pool.account.tokenBFlag),
                    referralTokenAccount: null,
                })
                break
        }

        const tx = new Transaction().add(swapIx)

        // 用你的钱包签名
        tx.feePayer = walletPublicKey

        const { blockhash: recentBlockhash } =
            await connection.getLatestBlockhash()
        tx.recentBlockhash = recentBlockhash

        // const signedTx = await loginModel.signTransaction(tx.serialize({ requireAllSignatures: false }));
        // const signedTx = await wallet.signTransaction(tx);
        const signedTx = await signTransaction(
            tx.serialize({ requireAllSignatures: false })
        )

        const signature = await connection.sendRawTransaction(
            signedTx.signedTransaction,
            {
                skipPreflight: false,
                preflightCommitment: 'confirmed',
            }
        )
        let confirmResult = null
        const maxRetries = 5
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                confirmResult = await connection.confirmTransaction(
                    { signature },
                    'confirmed'
                )
                return { signature, confirmResult }
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error)
            }
        }
        if (!confirmResult) {
            throw new Error(
                'Failed to confirm transaction after multiple attempts'
            )
        }
    } catch (error) {
        console.warn('buy_tokens failed:', error)
        throw error
    }
}

export async function pre_sell_tokens(mint, amount_in, slippage_bps) {
    try {
        // mint = "FQMahVWHmRT6bqdDsZgP1jGKX3ksh7JDiR9Z9sEUrYpd";
        mint = new PublicKey(mint)

        const connection = new Connection(uri, 'confirmed')
        const client = new DynamicBondingCurveClient(connection, 'confirmed')

        const virtualPoolState = await client.state.getPoolByBaseMint(mint)
        let amountOut = new BN(0)
        switch (virtualPoolState?.account?.isMigrated ?? 1) {
            case 0:
                const poolConfigState = await client.state.getPoolConfig(
                    virtualPoolState.account.config
                )

                const currentPoint = await getCurrentPoint(
                    connection,
                    poolConfigState.activationType
                )

                const amountBN = new BN(amount_in).mul(
                    new BN(10).pow(new BN(poolConfigState.tokenDecimal))
                )

                const { minimumAmountOut } = client.pool.swapQuote({
                    virtualPool: virtualPoolState.account,
                    config: poolConfigState,
                    swapBaseForQuote: true,
                    amountIn: amountBN, // new BN(Number(amount_in) * 10 ** poolConfigState.tokenDecimal),
                    slippageBps: slippage_bps,
                    hasReferral: false,
                    currentPoint,
                })
                amountOut =
                    minimumAmountOut / 10 ** poolConfigState.tokenDecimal
                break
            case 1:
                slippage_bps = slippage_bps / 100
                const cpAmm = new CpAmm(connection)
                const pool = await getPoolByBaseMint(cpAmm, mint)
                if (!pool) {
                    throw new Error('pool not found')
                }

                const [mintAInfo, mintBInfo, currentSlot] = await Promise.all([
                    getMint(connection, mint),
                    getMint(connection, pool.account.tokenBMint),
                    connection.getSlot(),
                ])

                const blockTime = await connection.getBlockTime(currentSlot)

                const amountBN2 = new BN(amount_in).mul(
                    new BN(10).pow(new BN(mintAInfo.decimals))
                )

                const { minSwapOutAmount } = cpAmm.getQuote({
                    inAmount: amountBN2, //new BN(Number(amount_in) * 10 ** mintAInfo.decimals),
                    inputTokenMint: mint,
                    slippage: slippage_bps,
                    poolState: pool.account,
                    currentTime: blockTime,
                    currentSlot,
                    tokenADecimal: mintAInfo.decimals,
                    tokenBDecimal: mintBInfo.decimals,
                })
                amountOut = minSwapOutAmount / 10 ** mintBInfo.decimals
                break
        }

        return amountOut.toString()
    } catch (error) {
        console.warn('pre_sell_tokens failed:', error)
        return '0'
    }
}

export async function sell_tokens(
    signTransaction,
    wallet,
    mint,
    amount_in,
    slippage_bps
) {
    try {
        // mint = "FQMahVWHmRT6bqdDsZgP1jGKX3ksh7JDiR9Z9sEUrYpd";
        mint = new PublicKey(mint)

        const walletPublicKey = new PublicKey(wallet.address)

        const connection = new Connection(uri, 'confirmed')
        const client = new DynamicBondingCurveClient(connection, 'confirmed')

        const virtualPoolState = await client.state.getPoolByBaseMint(mint)

        let swapIx = null
        switch (virtualPoolState?.account?.isMigrated ?? 1) {
            case 0:
                const poolConfigState = await client.state.getPoolConfig(
                    virtualPoolState.account.config
                )

                const currentPoint = await getCurrentPoint(
                    connection,
                    poolConfigState.activationType
                )

                const amountBN = new BN(amount_in).mul(
                    new BN(10).pow(new BN(poolConfigState.tokenDecimal))
                )

                const { minimumAmountOut } = client.pool.swapQuote({
                    virtualPool: virtualPoolState.account,
                    config: poolConfigState,
                    swapBaseForQuote: true,
                    amountIn: amountBN, //new BN(Number(amount_in) * 10 ** poolConfigState.tokenDecimal),
                    slippageBps: slippage_bps,
                    hasReferral: false,
                    currentPoint,
                })

                swapIx = await client.pool.swap({
                    owner: walletPublicKey,
                    amountIn: amountBN, //new BN(Number(amount_in) * 10 ** poolConfigState.tokenDecimal),
                    minimumAmountOut: minimumAmountOut,
                    swapBaseForQuote: true,
                    pool: virtualPoolState.publicKey,
                    referralTokenAccount: null,
                    payer: walletPublicKey,
                })
                break
            case 1:
                slippage_bps = slippage_bps / 100
                const cpAmm = new CpAmm(connection)
                const pool = await getPoolByBaseMint(cpAmm, mint)
                if (!pool) {
                    throw new Error('pool not found')
                }

                const [mintAInfo, mintBInfo, currentSlot] = await Promise.all([
                    getMint(connection, mint),
                    getMint(connection, pool.account.tokenBMint),
                    connection.getSlot(),
                ])

                const blockTime = await connection.getBlockTime(currentSlot)
                const amountBN2 = new BN(amount_in).mul(
                    new BN(10).pow(new BN(mintAInfo.decimals))
                )

                const { minSwapOutAmount } = cpAmm.getQuote({
                    inAmount: amountBN2, //new BN(Number(amount_in) * 10 ** mintAInfo.decimals),
                    inputTokenMint: mint,
                    slippage: slippage_bps,
                    poolState: pool.account,
                    currentTime: blockTime,
                    currentSlot,
                    tokenADecimal: mintAInfo.decimals,
                    tokenBDecimal: mintBInfo.decimals,
                })
                swapIx = await cpAmm.swap({
                    payer: walletPublicKey,
                    pool: pool.publicKey,
                    inputTokenMint: pool.account.tokenAMint,
                    outputTokenMint: pool.account.tokenBMint,
                    amountIn: amountBN2, //new BN(Number(amount_in) * 10 ** mintBInfo.decimals),
                    minimumAmountOut: minSwapOutAmount,
                    tokenAMint: pool.account.tokenAMint,
                    tokenBMint: pool.account.tokenBMint,
                    tokenAVault: pool.account.tokenAVault,
                    tokenBVault: pool.account.tokenBVault,
                    tokenAProgram: getTokenProgram(pool.account.tokenAFlag),
                    tokenBProgram: getTokenProgram(pool.account.tokenBFlag),
                    referralTokenAccount: null,
                })
                break
        }

        const tx = new Transaction().add(swapIx)

        // 用你的钱包签名
        tx.feePayer = walletPublicKey

        const { blockhash: recentBlockhash } =
            await connection.getLatestBlockhash()
        tx.recentBlockhash = recentBlockhash

        //const signedTx = await loginModel.signTransaction(tx.serialize({ requireAllSignatures: false }));
        //const signedTx = await wallet.signTransaction(tx);
        const signedTx = await signTransaction(
            tx.serialize({ requireAllSignatures: false })
        )

        const signature = await connection.sendRawTransaction(
            signedTx.signedTransaction,
            {
                skipPreflight: false,
                preflightCommitment: 'confirmed',
            }
        )
        let confirmResult = null
        const maxRetries = 5
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                confirmResult = await connection.confirmTransaction(
                    { signature },
                    'confirmed'
                )
                return { signature, confirmResult }
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error)
            }
        }
        if (!confirmResult) {
            throw new Error(
                'Failed to confirm transaction after multiple attempts'
            )
        }
    } catch (error) {
        console.warn('sell_tokens failed:', error)
        throw error
    }
}

export async function get_pool_config(configAddress) {
    try {
        const connection = new Connection(uri, 'confirmed')
        const client = new DynamicBondingCurveClient(connection, 'confirmed')
        const poolConfigState = await client.state.getPoolConfig(configAddress)

        console.log('get_pool_config ' + JSON.stringify(poolConfigState))

        return poolConfigState
    } catch (error) {
        console.warn('get_pool_config failed:', error)
        throw error
    }
}
/**
 * 
    RentExemptFee = uint64(2_039_280)
    TransferFee   = uint64(5_000)
    MintFee       = uint64(3_000_000)
    F64UnknowFee  = float64(0.03)
    UnknowFee     = uint64(F64UnknowFee * 1e9) // 0.03
 */
export async function create_dbc_pool(signTransaction, wallet, config, params) {
    let tokenDecimal = 9
    let amount_in = params.preBuy
    let amountIn = new BN(Number(amount_in) * 10 ** tokenDecimal)

    const connection = new Connection(uri, 'confirmed')
    const client = new DynamicBondingCurveClient(connection, 'confirmed')

    if (signTransaction == null) {
        console.log(' signTransaction is Null')
        return
    }

    try {
        console.log(' Transaction amountIn:' + amountIn)

        const payerPublickey = new PublicKey(wallet.address)
        const configKey = new PublicKey(config)

        // 1) 从 base58 私钥（或 Uint8Array）恢复 Keypair
        const base58Secret =
            'N1zuUz5Q99YvuG9a2JFrxLz8XMbGZKzavZevN7ykKht3sC19hg7u4nHrX1S8NUXjQQuJyqkqNxK7W6DaSjmybBU'
        const secretUint8 = bs58.decode(base58Secret)
        const poolCreator = Keypair.fromSecretKey(secretUint8) // or new Uint8Array([...])

        const base58PSecret =
            '2bCoL7upg5jrRodu8hUA1csJLXWHNfk4XJgtu4PsuDmedRTh1HGsgy26JYgZeMjehavnMzg7eMVMSwqu5PDdySDa'
        const secretPUint8 = bs58.decode(base58Secret)
        const parterPublickey = Keypair.fromSecretKey(secretUint8) // or new Uint8Array([...])
        // console.log(
        //     `Generated keypairCreator: ${
        //         poolCreator.publicKey
        //     }, payer ${payerPublickey.toString()}`
        // )

        const baseMint = Keypair.generate()
        //const mint58Secret = "2anuacWHa3GpRKj8AtyFa3z2qEzKAsRSHJtKgLvTGWS46Zp2fRDtRkPZZFcKUscWzS5qHcAFwxQP5A3LZCXCurN6"
        //const mintsecretUint8 = bs58.decode(mint58Secret);
        //const baseMint =  Keypair.fromSecretKey(mintsecretUint8);
        console.log(`Generated base mint: ${baseMint.publicKey.toString()}`)

        //name symbol 和uri都是必须的
        const createPoolParam = {
            name: params?.name,
            symbol: params?.symbol,
            uri: params?.uri,
            payer: payerPublickey,
            poolCreator: poolCreator.publicKey,
            config: configKey,
            baseMint: baseMint.publicKey,
        }

        const firstBuyParam = {
            buyer: payerPublickey,
            buyAmount: amountIn,
            minimumAmountOut: new BN(1),
            referralTokenAccount: null,
            receiver: payerPublickey,
        }

        //Creator
        const creatorBuyParam = {
            creator: payerPublickey,
            buyAmount: amountIn,
            minimumAmountOut: new BN(1),
            referralTokenAccount: null,
            receiver: payerPublickey,
        }

        const partnerBuyParam = {
            partner: parterPublickey,
            buyAmount: amountIn,
            minimumAmountOut: new BN(1),
            referralTokenAccount: null,
            receiver: payerPublickey,
        }

        console.log(
            ' Transaction createPoolParam:' + JSON.stringify(createPoolParam)
        )

        //Case 1
        const { createPoolTx, swapBuyTx, swapBuyTx2 } =
            await client.pool.createPoolWithPartnerAndCreatorFirstBuy({
                createPoolParam,
                partnerBuyParam,
                creatorBuyParam,
            })
        const transaction = new Transaction()
        transaction.add(createPoolTx)
        //transaction.add(swapBuyTx)
        //transaction.add(swapBuyTx2)

        //Case 2
        //const createPoolTx = await client.pool.createPool(createPoolParam)

        //Case 3
        // const { createPoolTx, swapBuyTx } =
        //     await client.pool.createPoolWithFirstBuy({
        //         createPoolParam,
        //         firstBuyParam,
        //     })
        // const transaction = new Transaction()
        // transaction.add(createPoolTx)
        //transaction.add(swapBuyTx)

        console.log(' Transaction transaction:', JSON.stringify(transaction))
        const { blockhash: recentBlockhash } =
            await connection.getLatestBlockhash()
        transaction.feePayer = payerPublickey
        transaction.recentBlockhash = recentBlockhash

        // 注意：
        // 用户使用钱包签名 Phantom 这个顺序没问题
        // 用户mint和creator签名
        if (false) {
            //测试直接phantom签名, 3。0测试网络OK
            console.info('phantom wallet')
            const provider = window.phantom?.solana
            transaction.partialSign(baseMint)
            transaction.partialSign(poolCreator)
            const { signature } = await provider.signAndSendTransaction(
                transaction
            )
            // Phantom 签名
            console.log(' Transaction sent:', signature)
            return baseMint.publicKey.toString()
        }

        if (false) {
            //测试直接privy接口签名, 3.0测试网络OK
            console.info('privy signature')

            transaction.partialSign(baseMint)
            transaction.partialSign(poolCreator)
            let se = transaction.serialize({ requireAllSignatures: false })

            console.log(' Transaction serialize:', se)

            let signature = await signAndSendTransaction({
                transaction: se,
                wallet: wallet,
            })
            console.log(' Transaction signature:', signature)
            console.log(' Transaction sent:', signature)
            return baseMint.publicKey.toString()
        }

        //签名baseMint+poolCreator， 最后用户签名, 3.0测试网络OK
        transaction.partialSign(baseMint)
        transaction.partialSign(poolCreator)
        console.log(' Transaction signTx1 OK ')

        // let signTx1 = await signTransaction({
        //     transaction: transaction.serialize({ requireAllSignatures: false }),
        //     wallet: wallet,
        // })
        let signTx1 = await signTransaction(
            transaction.serialize({ requireAllSignatures: false })
        )
        let signTx = VersionedTransaction.deserialize(signTx1.signedTransaction)
        console.log(' Transaction signTx2 OK ')
        const signature = await connection.sendRawTransaction(
            signTx.serialize()
        )

        console.log(' Transaction signature:', signature)

        //确认链上情况
        let confirmResult = null
        const maxRetries = 5
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                confirmResult = await connection.confirmTransaction(
                    { signature },
                    'confirmed'
                )
                break
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error)
            }
        }

        if (!confirmResult) {
            throw new Error(
                'Failed to confirm transaction after multiple attempts'
            )
        }

        //return Mint hash
        return baseMint.publicKey.toString()
    } catch (error) {
        console.warn('create_dbc_pool failed:', error)
        if (error instanceof SendTransactionError) {
            const logs = await error.getLogs(connection)
            console.error('Transaction logs:', logs)
        }
        throw error
    }
}

export async function sign_base64Tranx(signTransaction, wallet, base64Tranx) {
    const connection = new Connection(uri, 'confirmed')
    const provider = window.phantom?.solana

    try {
        if (!signTransaction) {
            console.warn(' sign_base64Tranx signTransaction:' + signTransaction)
            return
        }

        //const base64Tranx2 = "AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIHIr6PVkVgeUqAlkklUb+3XUERhGHTjCrMlaT3+7BLcQ+zim/9l5z4tCUjLkrf2VwMt1vAITqN2Ks72AhSlEECte3RAxkmLZe/i8niIf5bxvW6SxFN2hPEmmnmscZChtIp0Je0Ja7wW214uI4AyAhMx14ni2vUbMlPuejMW0QAQMBCBKBivvqG40qVCzYFVo4mMiCjfSJVKazxdQjMB0GP7yvA2FAIMiL2KJosUUWwOB7A1tXU8uXFBtp0kuZE8rgJXDVsfSTg/Iwxpcr/VU9wd8U+iG+Tmdmf20N5ZjIJPVBekW/xHi4vqCgANNWY74+T8MimsDxYupu1bk8SRGc0NwjLT0liHdvshTU/LsqzJobBLZIu5mTwI04GcX4tSv+P6TbTR8eHyyrfA28IckbUpliYSGBt8KoX9k4TDuXPxvhYJmeVYyV3y/SfJfIAOrW0zNDzpgVZpMsIMO0zLWyGqlx+EY3JYJbHOkB9FTmZe4VNVJuht8L15NnRHL/nWBUXFCy2uesA4MNY11G48ZNOC/OYTp4tJdRoaxSkTFZezECkfIJYAylJPext9bMscOXOqAzDRkD2mAcybXe48ZitMrRSRacDaYXuNkt9er140ZBNeKlVy+aL4OYfSgHYHabwkqE2mNoH3KGvMgGcZ4sK1CiAVckO/yWaLEVILxThD7c2wgGm4hX/quBhPtof2NGGMA12sQ53BrrO1WYoPAAAAAAAQtwZbHj0XxFOJ1Sf2sEw81YuGxzGqD9tUm20bwD+ClGBt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGzWzIDHsAskwhAgOEM/SKoPyo7n6BkDPA/h+6co3/UMjJclj04kifG7PRApFI4NgwtaE5na/xCEBI572Nvp+FlHM8/QArCNJu41vYLSod5HL5XjG0/MxVMinAcncJKXmAcJEAoLAgEMAwQFBg0ADg4PEAlyjFXXsGY2aE8FAAAAU1VOTlkEAAAAU1VOTlUAAABodHRwczovL2FjdGlvbmxhYnMubXlwaW5hdGEuY2xvdWQvaXBmcy9RbWRWR0h2WlZKRURicmZtNVpNUXlCNURZY3VZTHF5TGdZOGc2cXhqcUN5YU1iEQYABwAMDw4AEQYACAABDw4ADwIABwwCAAAAgPD6AgAAAAAOAQcBEQkPCwoDBwgEBQEMAA4OCRAJGPjGnpHhdYfIgPD6AgAAAAAx11tD1Q9MAA4DBwAAAQk="
        if (false) {
            //测试OK
            let signTx1 = Transaction.from(Buffer.from(base64Tranx, 'base64'))
            console.log(
                `phantom 交易成功！交易签名 signTx1: ${JSON.stringify(signTx1)}`
            )
            let signtx = await provider.signTransaction(signTx1)
            console.log(`交易成功！交易签名: ${JSON.stringify(signtx)}`)
            let signature2 = await connection.sendRawTransaction(signtx, {
                skipPreflight: false,
                preflightCommitment: 'confirmed',
            })
            console.log(' phantom wallet signature:', signature2)
            return signature2
        }

        if (false) {
            //测试OK

            let signTx = Transaction.from(Buffer.from(base64Tranx, 'base64'))
            console.log(
                `phantom 交易成功！交易签名 signTx1: ${JSON.stringify(signTx)}`
            )
            const { signature } = await provider.signAndSendTransaction(signTx)
            console.log(' phantom wallet signature:', signature)
            return signature
        }

        //let tx = Transaction.from(Buffer.from(base64Tranx, "base64"));
        //let signTx = await signTransaction(tx.serialize({ requireAllSignatures: false }));
        //let sign = VersionedTransaction.deserialize(signTx.signedTransaction)
        //console.log(`交易成功！交易签名: ${JSON.stringify(sign)}`);

        let signTx = await signTransaction(Buffer.from(base64Tranx, 'base64'))
        let signature = await connection.sendRawTransaction(
            signTx.signedTransaction,
            {
                skipPreflight: false,
                preflightCommitment: 'confirmed',
            }
        )

        console.log(' sign_base64Tranx signature:', signature)

        // 确认链上情况
        let confirmResult = null
        const maxRetries = 5
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                confirmResult = await connection.confirmTransaction(
                    { signature },
                    'confirmed'
                )
                break
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error)
            }
        }

        if (!confirmResult) {
            console.warn(
                'Failed to confirm transaction after multiple attempts'
            )
            return null
        }

        console.log(' sign_base64Tranx confirmResult:', confirmResult)

        return signature
    } catch (error) {
        console.warn('sign_base64Tranx failed:', error)
        throw error
        return null
    }
}

export async function send_base64Tranx(signTransaction, base64Tranx) {
    const connection = new Connection(uri, 'confirmed')
    const provider = window.phantom?.solana

    try {
        if (!signTransaction) {
            console.warn(' send_base64Tranx signTransaction:' + signTransaction)
            return
        }

        const rawTx = Uint8Array.from(Buffer.from(base64Tranx, 'base64'))

        //let tx = Transaction.from(Buffer.from(base64Tranx, "base64"));
        let signature = await connection.sendRawTransaction(
            Buffer.from(base64Tranx, 'base64'),
            {
                skipPreflight: false,
                preflightCommitment: 'confirmed',
            }
        )

        console.log(' send_base64Tranx signature:', signature)

        // 确认链上情况
        let confirmResult = null
        const maxRetries = 5
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                confirmResult = await connection.confirmTransaction(
                    { signature },
                    'confirmed'
                )
                break
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error)
            }
        }

        if (!confirmResult) {
            console.warn(
                'Failed to confirm transaction after multiple attempts'
            )
            return null
        }

        console.log(' send_base64Tranx confirmResult:', confirmResult)

        return signature
    } catch (error) {
        console.warn('send_base64Tranx failed:', error)
        return null
    }
}

export default {
    pre_buy_tokens,
    pre_sell_tokens,
    buy_tokens,
    sell_tokens,
    init_config_key,
    get_pool_config,
    create_dbc_pool,
    sign_base64Tranx,
    send_base64Tranx,
    manualMigrate,
}
