'use strict'

import axios, { getCookie } from './web/lib.http.js'
import { hex_md5 } from './utils/md5.js'

const get_uri = (path) => {
    return import.meta.env.VITE_API_URL + path
}

const getKeySort = (strArr) => {
    // var count = 0;
    var compareInt = 0
    for (var i = 0; i < strArr.length; i++) {
        for (var j = 0; j < strArr.length - 1 - i; j++) {
            /*if(strArr [j].substring(0,1) > strArr[j + 1].substring(0,1)){
                var temp = strArr[j + 1];
                strArr[j + 1] = strArr[j];
                strArr[j] = temp;
            }
            if(strArr [j].substring(0,1) == strArr[j + 1].substring(0,1)){
                if(strArr [j].substring(1,2) > strArr[j + 1].substring(1,2)){
                    var temp = strArr[j + 1];
                    strArr[j + 1] = strArr[j];
                    strArr[j] = temp;
                }
            }*/
            compareToIndexValue(strArr, compareInt, j)
            // count++;
        }
    }
    return strArr
}

/**
 *  根据首字母 排序,如果首字母相同则根据第二个字母排序...直到排出大小
 */
const compareToIndexValue = (arr, int, arrIndex) => {
    if (
        arr[arrIndex].substring(int, int + 1) ==
        arr[arrIndex + 1].substring(int, int + 1)
    )
        compareToIndexValue(arr, int + 1, arrIndex)
    //如果第一位相等,则继续比较第二个字符
    else if (
        arr[arrIndex].substring(int, int + 1) >
        arr[arrIndex + 1].substring(int, int + 1)
    ) {
        var temp = arr[arrIndex + 1]
        arr[arrIndex + 1] = arr[arrIndex]
        arr[arrIndex] = temp
    }
    /*else if(arr[arrIndex].substring(int,int+1) < arr[arrIndex + 1].substring(int,int+1)) return;*/
    return
}

/**
 * 输入排序过后的key=value 值数组,用  "&" 字符拼接为字符串
 */
const getKeyValueSortStr = (strArr) => {
    var longStr = ''
    for (var str in strArr) {
        longStr += strArr[str] + '&'
    }
    return longStr.substring(0, longStr.length - 1) //移除最后一个 & 符号
}

const baseString = (data_sign, funName, method, url) => {
    let data = QS.stringify(data_sign)
    var paraArr = data.split('&')
    for (var i = 0; i < paraArr.length; i++) {
        if (paraArr[i].indexOf('=') + 2 > paraArr[i].length) {
            //移除value 为空的参数
            paraArr.splice(i, 1)
            i--
        }
    }
    var sortParaArr = getKeySort(paraArr)
    var paraStr = getKeyValueSortStr(sortParaArr)
        .replace(/\+/g, ' ')
        .replace(/%3A/g, ':') //得到字符串 , + 是特殊字符,需要转义符号 \
    var http = url.split(funName)[0]
    var baseString = method + '&' + http + funName + '&' + paraStr
    // data_all.sign = md5.hex_md5(unescape(baseString) + app_secret + this.getCookie('secret'));
    return baseString
}

const get_signature = (url, params) => {
    const data_base = {}
    const data = params
    const timestamp = Date.parse(new Date()) / 1000
    const nonce = hex_md5(timestamp)
    const app_secret = process.env.VUE_APP_APP_SECRET
    const name = process.env.VUE_APP_API_URL
    let routeName = url.split(name)[1]
    const access_secret = getCookie('login_secret') || '我的天哪噜'
    const access_token = getCookie('login_token') || '我的天哪噜'
    data.app_id = process.env.VUE_APP_APP_ID
    data.timestamp = timestamp
    data.access_token = access_token
    data.lang = 'zh-CN' // "en-US" store.state.lang || "zh-CN";
    data.nonce = nonce

    data_base.timestamp = timestamp
    data_base.nonce = nonce

    var baseString1 = baseString(data_base, routeName, 'POST', url)
    data.sign = hex_md5(baseString1 + app_secret + access_secret)
    return data
}

async function get_new_name_info() {
    const uri = get_uri('/newgame/info')
    try {
        const response = await axios.post(
            uri,
            {},
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        )
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

async function get_new_game_list(page, page_size, keyword) {
    const uri = get_uri('/newgame/list')
    const params = {
        page: page,
        page_size: page_size,
        keyword: keyword,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

async function get_new_game_spl_token_associated(mint_addr, wallet_addr) {
    const uri = get_uri('/newgame/spltoken/associated')
    const params = {
        mint_addr: mint_addr,
        wallet_addr: wallet_addr,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

async function get_new_game_list_burn(page, page_size, addr) {
    const uri = get_uri('/newgame/list/burn')
    const params = {
        page: page,
        page_size: page_size,
        addr: addr,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

async function get_new_game_list_detail(mint) {
    const uri = get_uri('/newgame/coin/show')
    const params = {
        mint: mint,
    }
    try {
        const { data } = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return data
    } catch (error) {
        throw error.response?.data || error
    }
}

//评论列表
async function comment_list(page, page_size, coin_id) {
    const uri = get_uri('/newgame/coin/comment_list')
    const params = {
        page: page,
        pagesize: page_size,
        coin_id: coin_id,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//用户信息
async function get_user_info(addr) {
    const uri = get_uri('/newgame/user/user_info')
    const params = {
        addr: addr,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//TOKEN HELD
async function get_token_held(page, page_size, addr) {
    const uri = get_uri('/newgame/coin/token_held')
    const params = {
        page: page,
        pagesize: page_size,
        addr: addr,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//TOKEN CREATED
async function get_created(page, page_size, addr) {
    const uri = get_uri('/newgame/coin/token_created')
    const params = {
        page: page,
        pagesize: page_size,
        addr: addr,
    }
    try {
        return await axios
            .post(uri, QS.stringify(params), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then((res) => res.data)
    } catch (error) {
        throw error.response?.data || error
    }
}

//txs list
async function get_txs_list(page, page_size, mint) {
    const uri = get_uri('/newgame/coin/txs')
    const params = {
        page: page,
        pagesize: page_size,
        mint: mint,
    }
    try {
        return await axios
            .post(uri, QS.stringify(params), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then((res) => res.data)
    } catch (error) {
        throw error.response?.data || error
    }
}

// 列表查询mint信息
async function get_query_coins(mint) {
    const uri = get_uri('/newgame/coin/query_coins')
    const params = {
        mint: mint,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

// header notify
async function get_coin_notify() {
    const uri = get_uri('/newgame/coin/notify')
    try {
        const response = await axios.post(
            uri,
            {},
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        )
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//根据地址查询用户信息
async function get_user_info_other(addr) {
    const uri = get_uri('/newgame/user/system_user')
    const params = {
        addr: addr,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//查询mint的详情
async function get_mint_adv_payer(mint) {
    const uri = get_uri('/newgame/coin/query_sponsor')
    const params = {
        mint: mint,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

// 创建查询交易状态
async function get_coin_query_signature(signature) {
    const uri = get_uri('/newgame/coin/query_signature')
    const params = {
        signature: signature,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//meme100list
async function get_meme100_list(page, page_size) {
    const uri = get_uri('/newgame/activity/meme')
    const params = {
        page: page,
        pagesize: page_size,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

async function get_is_twitter(addr) {
    const uri = get_uri('/newgame/query_twitter_users')
    const params = {
        addr: addr,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//获取币的版本v1还是v2
async function get_is_v1_or_v2(mint) {
    const uri = get_uri('/newgame/coin/query_coin_version')
    const params = {
        mint: mint,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//查询发射是否成功
async function get_permit_status(signature) {
    const uri = get_uri('/newgame/coin/query_permit_signature')
    const params = {
        signature: signature,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//查询K线数据
async function get_charts_data(interval, mint, start_time, end_time) {
    const uri = get_uri('/newgame/chart/chart_data')
    const params = {
        interval: interval,
        mint: mint,
        start_time: start_time,
        end_time: end_time,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

// 2.1版本新合约
// 高级创建配置
async function get_chain_asset_config() {
    const uri = get_uri('/newgame/query/chain_asset_config')
    try {
        const response = await axios
            .post(
                uri,
                {},
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            )
            .then((res) => res.data)
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

// board使用的query_users
async function get_query_users(addr) {
    const uri = get_uri('/newgame/query_users')
    const params = {
        addr: addr,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

// 在game合约内创建的mint
async function get_query_coin_list(page, page_size, keyword) {
    const uri = get_uri('/newgame/query_coin_list')
    const params = {
        page: page,
        page_size: page_size,
        keyword: keyword,
        is_cloneai: 1,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

// 交易大赛
async function get_trading_rounds_list() {
    const uri = get_uri('/newgame/activity/trading/rounds_list')
    try {
        const response = await axios.post(
            uri,
            {},
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        )
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

async function get_trading_rounds_info(round_id, addr) {
    const uri = get_uri('/newgame/activity/trading/rounds_info')
    const params = {
        round_id: round_id,
        addr: addr,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

async function get_trading_ranking_list(page, page_size, round_id) {
    const uri = get_uri('/newgame/activity/trading/ranking_list')
    const params = {
        page: page,
        page_size: page_size,
        round_id: round_id,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

async function get_trading_rounds_ranking_info(mint) {
    const uri = get_uri('/newgame/activity/trading/rounds_ranking_info')
    const params = {
        mint: mint,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//v2fomo 3D交易大赛
async function get_trading_rounds_info_v2(round_id, addr) {
    const uri = get_uri('/newgame/activity/trading/fomo_rounds_info')
    const params = {
        round_id: round_id,
        addr: addr,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

async function get_reward_history(page, page_size, round_id) {
    const uri = get_uri('/newgame/activity/trading/fomo_reawar_history')
    const params = {
        page: page,
        pagesize: page_size,
        round_id: round_id,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

async function get_fomo3d_reward(round_id, addr) {
    const uri = get_uri('/newgame/activity/trading/fomo_is_winning')
    const params = {
        round_id: round_id,
        addr: addr,
    }
    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

// 登录
async function get_new_game_sign_in(pubkey_b58, signature_fun) {
    const currentTime = Date.now() / 1000
    const signature_bs58 = await signature_fun(currentTime)

    const uri = get_uri('/newgame/signin')
    const params = {
        pubkey: pubkey_b58,
        msg: currentTime,
        sign: signature_bs58,
    }
    try {
        return await axios
            .post(uri, QS.stringify(params), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then((res) => res.data)
    } catch (error) {
        throw error.response?.data || error
    }
}

//添加评论
async function add_comment(mint, coin_id, content, image_url) {
    const uri = get_uri('/newgame/coin/add_comment')

    const params = get_signature(uri, {
        mint: mint,
        coin_id: coin_id,
        content: content,
        image_url: image_url,
    })

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//设置用户信息
async function set_user_info(avatar, user_name, intro) {
    const uri = get_uri('/newgame/user/set_user_info')

    const params = get_signature(uri, {
        avatar: avatar,
        user_name: user_name,
        intro: intro,
    })

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//获取safe_token
async function get_safe_token() {
    const uri = get_uri('/newgame/user/safe_token')
    const params = get_signature(uri, {})

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//解绑twitter
async function unlock_twitter() {
    const uri = get_uri('/newgame/auth/twitter/two/unbind')
    const params = get_signature(uri, {})

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//获取奖券列表
async function get_coupon_list(page, page_size, addr) {
    const uri = get_uri('/newgame/coin/user/lotter_tickets')

    const params = get_signature(uri, {
        page: page,
        pagesize: page_size,
        addr: addr,
    })

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//获取钱包接口sol
async function get_ballance_value(addr) {
    const uri = get_uri('/newgame/user/asset/coin')

    const params = get_signature(uri, {
        addr: addr,
    })

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//开奖列表资产变动
async function get_coupon_ballance_list(page, page_size, addr, symbol) {
    const uri = get_uri('/newgame/user/asset/events')

    const params = get_signature(uri, {
        addr: addr,
        page: page,
        pagesize: page_size,
        symbol: symbol,
    })

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//添加个人新的list列表
async function get_person_list(page, page_size, addr) {
    const uri = get_uri('/newgame/coin/token_Listed')

    const params = get_signature(uri, {
        addr: addr,
        page: page,
        pagesize: page_size,
    })

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//查询jackpot奖励
async function get_jackpot(signature) {
    const uri = get_uri('/newgame/coin/query_trades')

    const params = get_signature(uri, {
        signature: signature,
    })

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//获取开宝箱配置
async function get_open_box_config(addr) {
    const uri = get_uri('/newgame/activity/open_box/info')

    const params = get_signature(uri, {
        addr: addr,
    })

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//获取开宝箱配置
async function get_open_box_status(signature) {
    const uri = get_uri('/newgame/activity/open_box/query_signature')

    const params = get_signature(uri, {
        signature: signature,
    })

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//查询提现是否成功
async function get_withdraw_status(signature) {
    const uri = get_uri('/newgame/activity/wd/query_signature')

    const params = get_signature(uri, {
        signature: signature,
    })

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//查询提现配置接口
async function get_withdraw_config(addr) {
    const uri = get_uri('/newgame/activity/wd/info')

    const params = get_signature(uri, {
        addr: addr,
    })

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//swap配置
async function get_swap_config(addr) {
    const uri = get_uri('/newgame/activity/exchange/info')

    const params = get_signature(uri, {
        addr: addr,
    })

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//查询swap是否成功
async function get_swap_status(signature) {
    const uri = get_uri('/newgame/activity/exchange/query_signature')

    const params = get_signature(uri, {
        signature: signature,
    })

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//查询swap是否成功
async function get_history() {
    const uri = get_uri('/newgame/reward/emit/pending')

    const params = get_signature(uri, {})

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//邀请详情
async function get_invite_info() {
    const uri = get_uri('/newgame/invite/info')

    const params = get_signature(uri, {})

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

//设置邀请码
async function set_invite_info(invite_code) {
    const uri = get_uri('/newgame/invite/set')

    const params = get_signature(uri, {
        invite_code: invite_code,
    })

    try {
        const response = await axios.post(uri, QS.stringify(params), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error
    }
}

export default {
    get_new_name_info,
    get_new_game_list,
    get_new_game_spl_token_associated,
    get_new_game_list_burn,
    get_new_game_list_detail,
    comment_list,
    get_user_info,
    get_token_held,
    get_created,
    get_txs_list,
    get_query_coins,
    get_coin_notify,
    get_user_info_other,
    get_mint_adv_payer,
    get_coin_query_signature,
    get_meme100_list,
    get_is_twitter,
    get_is_v1_or_v2,
    get_permit_status,
    get_charts_data,
    get_chain_asset_config,
    get_query_users,
    get_query_coin_list,
    get_trading_rounds_list,
    get_trading_rounds_info,
    get_trading_ranking_list,
    get_trading_rounds_ranking_info,
    get_trading_rounds_info_v2,
    get_reward_history,
    get_fomo3d_reward,
    get_new_game_sign_in,
    add_comment,
    set_user_info,
    get_safe_token,
    unlock_twitter,
    get_coupon_list,
    get_ballance_value,
    get_coupon_ballance_list,
    get_person_list,
    get_jackpot,
    get_open_box_config,
    get_open_box_status,
    get_withdraw_status,
    get_withdraw_config,
    get_swap_config,
    get_swap_status,
    get_history,
    get_invite_info,
    set_invite_info,
}
