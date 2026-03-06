import lib_web3 from './web3/lib.web3.js'
import lib_meteora from './web3/lib.meteora.js'
import libamock from './lib.api.mock.js'
import libAgent from './lib.api.wave.js'

const ApiBase = import.meta.env.VITE_API_URL
/** 为 true 时使用本地 mock 实现（见 api.md），便于本地调试 */
const USE_MOCK =
    import.meta.env.VITE_USE_MOCK_API === 'true' ||
    import.meta.env.VITE_USE_MOCK_API === '1'
const api = USE_MOCK ? libamock : libAgent

// ——— api.md 文档接口：System / User / Product ———
/** GET System Info — POST /1/system/info */
export const apiGetSystemInfo = () => api.get_system_info()
/** User Login — POST /1/user/login, body: { wallet } */
export const apiLogin = (token, address) => api.login(token, address)
/** Get User Info — POST /1/user/info */
export const apiGetUserInfo = (token) => api.get_user_info(token)
/** Claim Prize — POST /1/user/prize/claim */
export const apiClaimPrize = (token) => api.claim_prize(token)
/** Create Product (Extended) — POST /product/create_ex, Admin auth */
export const apiProductCreateEx = (token, data) =>
    api.product_create_ex(token, data)

// ——— 其他 Wave 接口（未在 api.md 的沿用远程） ———
export const subscribeWinnersMQTT = (onWinners) =>
    libAgent.subscribeWinnersMQTT(onWinners)
export const normalizeWinner = libAgent.normalizeWinner

/*******************************链上信息*************************************/
export const apiGetUSDCHolding = (address) => lib_web3.get_usdc_holding(address)
export const apiGetSolBalance = (address) => lib_web3.get_sol_balance(address)
export const apiGetMultBalance = (addresses) =>
    lib_web3.get_mult_balance(addresses)
export const apiSwapToken = (wallet, mint, amountInLamports, slippageBps) =>
    lib_web3.swap_tokens(wallet, mint, amountInLamports, slippageBps)
export const apiGetTokenAccountsByOwner = (address) =>
    lib_web3.get_token_accounts_by_owner(address)

// 计算获得的代币token数量
export const preBuyMintTokens = (sol_count, mint, slippageBps) =>
    lib_meteora.pre_buy_tokens(mint, sol_count, slippageBps)

// 购买代币
export const buyMintTokens = (wallet, mint, sol_count, slippageBps) =>
    lib_meteora.buy_tokens(wallet, mint, sol_count, slippageBps)

// 计算获得的sol 数量
export const preSellMintTokens = (token_count, mint, slippageBps) =>
    lib_meteora.pre_sell_tokens(mint, token_count, slippageBps)

// 出售代币
export const sellMintTokens = (wallet, mint, token_count, slippageBps) =>
    lib_meteora.sell_tokens(wallet, mint, token_count, slippageBps)
