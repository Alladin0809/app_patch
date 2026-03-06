'use strict'

const MOCK_DELAY_MS = 500
const delay = () => new Promise((r) => setTimeout(r, MOCK_DELAY_MS))

/** 模拟 ProductState: 0=Ready, 1=DBC, 2=DAMMv2 */
const ProductState = { Ready: 0, DBC: 1, DAMMv2: 2 }
/** 模拟 PveRoundState: 0=Available, 1=Claimed */
const PveRoundState = { Available: 0, Claimed: 1 }

/** 模拟系统信息 — 对应 api.md GET System Info */
async function get_system_info() {
    await delay()
    const now = Math.floor(Date.now() / 1000)
    return {
        code: 200,
        now,
        date: new Date(now * 1000).toISOString().slice(0, 19).replace('T', ' '),
        sol_price: '150.50',
        preview: true,
        product: {
            mint: 'mock_mint_xxx',
            price: '0.01',
            product_volume: '1000000',
            status: ProductState.Ready,
            quote_reserve: '50000',
            process: '5000',
        },
        round: {
            id: 1,
            end_time: now + 86400,
            prize: '100.00',
            privy_wallet_address: '',
            state: PveRoundState.Available,
            ctime: new Date().toISOString(),
            mtime: new Date().toISOString(),
        },
    }
}

/** 模拟用户登录 — 对应 api.md User Login */
async function login(token, walletAddress) {
    if (!token) {
        await delay()
        return { code: 401, message: 'token required' }
    }
    await delay()
    return { code: 200 }
}

/** 模拟用户信息(历史 PVE 轮次) — 对应 api.md Get User Info */
async function get_user_info(token) {
    if (!token) {
        await delay()
        return { code: 401, message: 'token required' }
    }
    await delay()
    return {
        code: 200,
        rounds: [
            {
                id: 1,
                end_time: Math.floor(Date.now() / 1000) - 3600,
                prize: '50.00',
                privy_wallet_address: '',
                state: PveRoundState.Available,
                ctime: new Date().toISOString(),
                mtime: new Date().toISOString(),
            },
        ],
    }
}

/** 模拟领取奖励 — 对应 api.md Claim Prize */
async function claim_prize(token) {
    if (!token) {
        await delay()
        return { code: 401, message: 'token required' }
    }
    await delay()
    return {
        code: 200,
        base64_transaction: 'mock_base64_tx_placeholder',
        balance: 10.5,
    }
}

/** 模拟创建产品(扩展) — 对应 api.md Create Product (Extended) */
async function product_create_ex(token, data) {
    if (!token) {
        await delay()
        return { code: 401, message: 'token required' }
    }
    await delay()
    return {
        code: 200,
        bundle_ids: ['mock_tx_sig_1', 'mock_tx_sig_2'],
    }
}

export default {
    get_system_info,
    login,
    get_user_info,
    claim_prize,
    product_create_ex,
}
