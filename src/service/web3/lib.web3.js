'use strict'
import {
    Connection,
    PublicKey,
    clusterApiUrl,
    SystemProgram,
    Transaction,
} from '@solana/web3.js'
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token'
import BigNumber from 'bignumber.js'
// import BN from 'bn.js'
import { lookupKnownSPLToken } from "@faremeter/info/solana";

const uri = import.meta.env.VITE_SOLSCAN_RPC
    ? import.meta.env.VITE_SOLSCAN_RPC
    : clusterApiUrl(import.meta.env.VITE_WALLET_NET)

// const confirmOptions = {
//     skipPreflight: true,
// }

const numToString = (num) => {
    let m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/)
    return num.toFixed(Math.max(0, (m[1] || '').length - m[2]))
}

async function buildTransferTransaction(
    connection,
    senderAddress,
    recipientAddress,
    amountInLamports
) {
    const transaction = new Transaction()

    // 创建转账指令
    const transferInstruction = SystemProgram.transfer({
        fromPubkey: new PublicKey(senderAddress),
        toPubkey: new PublicKey(recipientAddress),
        lamports: amountInLamports, // 金额以 lamports 为单位（1 SOL = 1,000,000,000 lamports）
    })

    // 添加指令到交易
    transaction.add(transferInstruction)

    // 获取最新的 blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = new PublicKey(senderAddress)

    return transaction
}

async function transfer_solana(wallet, recipientAddress, amount) {
    const connection = new Connection(uri, 'confirmed')
    console.log('transfer_solana ' + JSON.stringify(wallet))

    //sendTransaction; signTransaction
    if (!wallet || !wallet.address) {
        console.warn('请先连接钱包')
        return
    }

    if (!recipientAddress || !amount) {
        console.warn('请输入接收地址和转账金额')
        return
    }

    if (wallet?.signTransaction == null) {
        console.warn('signTransaction is empty')
    }

    try {
        const lamports = Math.floor(parseFloat(amount) * 1_000_000_000) // 将 SOL 转换为 lamports
        const transaction = await buildTransferTransaction(
            connection,
            wallet.address,
            recipientAddress,
            lamports
        )

        // 发送交易，这个调用Privy弹出框进行交
        if (wallet.walletClientType === 'privy') {
            console.info('privy wallet')
            const receipt = await wallet?.sendTransaction({
                transaction: transaction,
                connection: connection,
                uiOptions: {
                    chain: 'solana', // ✅ 告诉 Privy UI 这是 Solana
                    displayCurrency: 'SOL', // ✅ 显示 SOL 而不是其他代币
                    theme: 'dark', // 可选：UI 主题
                    showWalletUIs: true, // 不展示 Privy 的默认金额 UI
                },
                address: wallet.address, // 指定签名钱包地址
            })

            console.log(`交易成功！交易签名: ${receipt.signature}`)
            return receipt.signature
        } else if (wallet.walletClientType === 'okx_wwallet') {
            console.info('okx wallet')
            const provider = window.okxwallet.solana
            await provider.connect()
            const { signature } = await provider.signAndSendTransaction(
                transaction
            )
            console.log(' Transaction sent:', signature, lamports)
            return signature
        } else if (wallet.walletClientType === 'solflare') {
            console.info('solflare wallet')
            //const provider = await wallet.getWalletClient()
            const provider = window.solflare
            await provider.connect()
            // 获取公钥
            const fromPubkey = new PublicKey(provider.publicKey)
            console.info('solflare wallet fromPubkey' + fromPubkey)

            const { signature } = await provider.signAndSendTransaction(
                transaction
            )
            console.log(' Transaction sent:', signature, lamports)
            return signature
            /*  } else if (wallet.walletClientType === 'phantom') {
                 
                 console.info('phantom wallet');
                 //const provider = await wallet.getWalletClient()
                 const provider = window.phantom
                 await provider.connect()
                 // 获取公钥
                 const fromPubkey = new PublicKey(provider.publicKey)
                 console.info('phantom wallet fromPubkey' + fromPubkey);
                 
                 const { signature } = await provider.signAndSendTransaction(transaction)
                 console.log(" Transaction sent:", signature, lamports);
                 return txid;*/
        } else {
            //privy/phantom
            // 交给 Privy 签名，不显示ui界面
            console.log(' Other wallet:' + wallet.walletClientType)
            //签名，不显示ui界面
            const signedTx = await wallet?.signTransaction(transaction)
            const txid = await connection.sendRawTransaction(
                signedTx.serialize()
            )
            console.log(' Transaction sent:', txid, lamports)
            return txid
        }

        return null
    } catch (error) {
        console.error('转账失败:', error)
    }
}
async function transaction_result(signature) {
    const connection = new Connection(uri, 'confirmed')
    console.log('transaction_result signature' + signature)

    // 1. 查询状态
    const result = await connection.getSignatureStatus(signature)
    console.log('状态:', result) //{ Ok: null } 表示成功

    //return result?.value?.status?.Ok == null

    // 2. 查询完整交易
    const tx = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
    })
    console.log('交易详情:', tx)

    if (tx?.meta?.err || tx?.meta?.status?.Err) {
        console.log('错误码 :', tx?.meta)
        return false
    }

    return true
}

async function swap_tokens(wallet, mint, amountInLamports, slippageBps = 0) {
    // 例如 mint -> SOL
    const connection = new Connection(uri, 'confirmed')
    let SOL_MINT = 'So11111111111111111111111111111111111111112'

    console.log(
        'swap_tokens mint:' + mint + 'amountInLamports' + amountInLamports
    )
    let jupiterQuoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${mint}&outputMint=${SOL_MINT}&amount=${amountInLamports}`

    const quote = await fetch(jupiterQuoteUrl).then((r) => r.json())

    // 请求 Swap Transaction
    // 调用 Jupiter 获取 Swap 交易
    const swapTxUrl = 'https://quote-api.jup.ag/v6/swap'
    const swapResponse = await fetch(swapTxUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            route: quote,
            userPublicKey: wallet.address,
        }),
    })

    const { swapTransaction } = await swapResponse.json()

    const tx = Transaction.from(Buffer.from(swapTransaction, 'base64'))

    // 用 Privy 签名
    const signedTx = await wallet?.signTransaction(tx)

    // 发送到链上
    const txid = await connection.sendRawTransaction(signedTx.serialize())
    console.log(' Swap success, txid:', txid)
    return txid
}

// async function get_usdc_holding(wallet) {
//     const connection = new Connection(uri, 'confirmed')

//     const USDC_MINT = new PublicKey(get_usdc_ca())

//     console.log('USDC address:', get_usdc_ca())
//     // 获取钱包的 USDC 关联账户
//     console.log('get_usdc_holding:', wallet?.address)
//     const ata = await getAssociatedTokenAddress(
//         USDC_MINT,
//         new PublicKey(wallet?.address)
//     )

//     // 查询账户信息
//     const accountInfo = await getAccount(connection, ata)
//     const balance = Number(accountInfo.amount) / 1e6 // USDC 有 6 位小数
//     console.log('USDC Balance:', balance)
//     return balance
// }

async function get_sol_balance(address) {
    try {
        console.log('get_sol_balance address ' + address)

        if (!!!address) return '0'

        const connection = new Connection(uri, 'confirmed')
        const balanceLamports = await connection.getBalance(
            new PublicKey(address)
        )
        const num = numToString(new BigNumber(balanceLamports).div(1e9))
        console.log('获取sol余额 success:', num)
        return num
    } catch (error) {
        console.warn('获取sol余额 failed:', error)
        return '0'
    }
}

async function get_mult_balance(addresses) {
    const publicKeys = addresses.map((addr) => new PublicKey(addr))
    const connection = new Connection(uri, 'confirmed')
    const accounts = await connection.getMultipleAccountsInfo(publicKeys)

    return accounts.map((acc, i) => ({
        address: addresses[i],
        balance: acc ? acc.lamports / 1e9 : 0, // lamports 转换为 SOL
    }))
}

async function get_mint_balance(address, mint) {
    try {
        const connection = new Connection(uri, 'confirmed')
        const associatedTokenAccount = getAssociatedTokenAddressSync(
            new PublicKey(mint),
            new PublicKey(address)
        )
        // 检测是否有这个关联地址
        // const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
        const { value } = await connection.getTokenAccountBalance(
            associatedTokenAccount
        )
        return value.uiAmount
    } catch (error) {
        return 0
    }
}

async function get_token_accounts_by_owner(walletAddress) {
    try {
        const connection = new Connection(uri, 'confirmed')
        //console.log("get_token_accounts_by_owner walletAddress:" + walletAddress)
        const tokenAccounts = await connection
            .getParsedTokenAccountsByOwner(new PublicKey(walletAddress), {
                programId: new PublicKey(
                    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
                ), // SPL 代币程序 ID
            })
            .then((res) => res.value)

        return tokenAccounts.map((account) => {
            const { mint, /*owner,*/ tokenAmount } =
                account.account.data.parsed.info
            return {
                mint,
                // owner,
                amount: tokenAmount.uiAmount,
                decimals: tokenAmount.decimals,
            }
        })
    } catch (error) {
        console.warn('get_token_accounts_by_owner fail', error)
        return null
    }
}

async function get_usdc_holding(address) {
    const connection = new Connection(uri, 'confirmed');

    const USDC_MINT = new PublicKey(get_usdc_ca())

    console.log('USDC address:', get_usdc_ca())
    // 获取钱包的 USDC 关联账户
    console.log('get_usdc_holding:', address)
    const ata = await getAssociatedTokenAddress(USDC_MINT, new PublicKey(address))

    // 查询账户信息
    const accountInfo = await getAccount(connection, ata)
    const balance = Number(accountInfo.amount) / 1e6  // USDC 有 6 位小数
    console.log('USDC Balance:', balance)
    return balance
}

function get_usdc_ca() {

    if (import.meta.env.VITE_WALLET_NET === "devnet") {
        return 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
    }

    const usdcInfo = lookupKnownSPLToken(import.meta.env.VITE_WALLET_NET, "USDC");

    return usdcInfo?.address ?? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
}


export default {
    swap_tokens,
    transaction_result,
    transfer_solana,
    get_usdc_holding,
    get_sol_balance,
    get_mult_balance,
    get_mint_balance,
    get_token_accounts_by_owner,
}
