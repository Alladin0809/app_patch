import {
    Connection,
    PublicKey,
    clusterApiUrl,
    VersionedTransaction,
} from '@solana/web3.js'
import { createPaymentHandler } from '@faremeter/payment-solana/exact'
import { wrap } from '@faremeter/fetch'
import { lookupKnownSPLToken } from '@faremeter/info/solana'

const uri = import.meta.env.VITE_SOLSCAN_RPC
    ? import.meta.env.VITE_SOLSCAN_RPC
    : clusterApiUrl(import.meta.env.VITE_WALLET_NET)
const network = import.meta.env.VITE_WALLET_NET

async function do402Payment(
    signTransaction,
    address,
    quantity,
    asset,
    originalUrl,
    token
) {
    const connection = new Connection(uri, 'confirmed')
    const usdcMint = new PublicKey(asset)
    const walletPubkey = new PublicKey(address || '')

    // Create wallet interface
    console.log('wallet: ' + address + ' quantity: ' + quantity)

    if (signTransaction == null) {
        console.error('signTransaction is null')
        return false
    }

    const wallet0 = {
        network: network,
        publicKey: walletPubkey,
        updateTransaction: async (tx) => {
            console.log('updateTransaction callback' + JSON.stringify(tx))

            let signtx = await signTransaction(
                tx.serialize({ requireAllSignatures: false })
            )
            const tx2 = VersionedTransaction.deserialize(
                signtx.signedTransaction
            )
            console.log(`交易成功！交易签名: ${JSON.stringify(tx2)}`)
            return tx2
        },
    }

    // Setup payment handler
    const handler = createPaymentHandler(wallet0, usdcMint, connection)
    const fetchWithPayer = wrap(fetch, { handlers: [handler] })

    // Call the API - payment happens automatically
    const response1 = await fetchWithPayer(
        //originalUrl + '?feePayer=' + address,
        originalUrl,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'OAuth2 ' + token,
            },
        }
    )

    //print the result
    const data = await response1.json()
    console.log(data)

    return data
}
export async function do402USDCPayment(
    signTransaction,
    address,

    quantity,
    originalUrl,
    token
) {
    const usdcInfo = lookupKnownSPLToken(network, 'USDC')

    // USDC mint address
    if (network == 'devnet') {
        return await do402Payment(
            signTransaction,
            address,
            quantity,
            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',

            originalUrl,
            token
        )
    } else {
        return await do402Payment(
            signTransaction,
            address,
            quantity,
            usdcInfo.address,
            originalUrl,
            token
        )
    }
}
