import lib_web3 from './web3/lib.web3.js'
import lib_meteora from './web3/lib.meteora.js'
import libamock from './lib.api.mock.js'
import libAgent from './lib.api.wave.js'

const ApiBase = import.meta.env.VITE_API_URL

/**************************后台通用接口-makewave信息************************/
export const apiGetSystemInfo = async () => {
    return await libAgent.get_system_info()
}
/***********************************************************/
export const apiGetCurrentRanks = () => libAgent.get_current_ranks()
export const apiGetHistoryRanks = () => libAgent.get_history_ranks()
export const subscribeWinnersMQTT = (onWinners) =>
    libAgent.subscribeWinnersMQTT(onWinners)
export const normalizeWinner = libAgent.normalizeWinner
export const apiLogin = (token, address) => libAgent.login(token, address)
export const apiGetUserInfo = (token) => libAgent.get_user_info(token)
export const apiBindTwitter = (token) => libAgent.post_bind_twitter(token)
export const apiBindCode = (token, code) => libAgent.post_bind_code(token, code)
export const apiGetRankReward = (token) => libAgent.get_rank_reward(token)
export const apiClaimRankReward = (token, params) =>
    libAgent.claim_rank_reward(token, params)
export const apiGetXUserInfo = (tsn) => libAgent.get_twitter_info(tsn)
export const apiGetProductList = (token, params) =>
    libAgent.get_product_list(token, params)
export const apiGetMyProducts = (token) => libAgent.get_mycreator_list(token)

export const apiGetProductInfo = (token, mint) =>
    libAgent.get_product_info(token, mint)
export const apiClaimToken = (token, params) =>
    libAgent.claim_product_reward(token, params)

export const apiCheckProduct = (token, tsn) =>
    libAgent.product_check_tsn(token, tsn)
export const apiProductCreate = (token, data) =>
    libAgent.product_create(token, data)
export const apiProductCreateEx = (token, data) =>
    libAgent.product_create_ex(token, data)

//Mock api
// export const apiCheckProduct = (token, tsn) => libamock.product_check_tsn(token, tsn)
// export const apiProductCreate = (token, data) => libamock.product_create(token, data)
// export const apiCreateFinish = (token, mints) =>
//     libamock.product_create_finish(token, mints)
// export const apiPlatformMobCreate = (token, data) =>
//     libamock.platform_mob_create(token, data)
// export const apiProductCreateEx = (token, data) =>
//     libamock.product_create_ex(token, data)
// export const apiPlatformMobCreateEx = (token, data) =>
//     libamock.platform_mob_create_ex(token, data)
/*******************************链上信息*************************************/
export const apiGetUSDCHolding = (address) => lib_web3.get_usdc_holding(address);
//export const apiGetSolBalance = (wallet) => {}
//export const apiGetTokenAccountsByOwner = (wallet) => {}
export const apiBuyMintTokens = (
    solwallet,
    mint,
    solCount,
    buyCount,
    slippageBps
) => { }
//export const apiGetMultBalance = (addresses) => {}
export const transferSolana = (wallet, recipientAddress, amount) => { }
export const apiGetUSDCCA = () => { }
export const transactionResult = (signature) => { }
//export const apiSwapToken = (wallet, mint, amountInLamports, slippageBps) => {}

/*******************************链上信息*************************************/
// 获取sol 余额
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
