'use strict'
import axios from './web/lib.http.js'
import mqtt from 'mqtt'
import { WAVE_API_CONFIG } from './wave.api.config.js'

const get_uri = (path) => {
    return import.meta.env.VITE_AGENT_API_URL + path
}

/**
 * 根据配置替换路径中的占位符，如 /1/twitter/info/:tsn + { tsn: 'x' } => /1/twitter/info/x
 */
function resolvePath(path, pathParams = {}) {
    if (!pathParams || Object.keys(pathParams).length === 0) return path
    return path.replace(/:(\w+)/g, (_, key) =>
        pathParams[key] != null ? encodeURIComponent(pathParams[key]) : ''
    )
}

/**
 * 通用 Wave API 请求执行器（业务可配置化）
 * @param {string} apiKey - wave.api.config.js 中的接口 key
 * @param {Object} options - { token, params, data, pathParams }
 * @returns {Promise<any>}
 */
async function waveRequest(apiKey, options = {}) {
    const config = WAVE_API_CONFIG[apiKey]
    if (!config) {
        console.warn('waveRequest: unknown api key ' + apiKey)
        return
    }

    const { token, params = {}, data, pathParams = {} } = options

    if (config.requireToken && !token) {
        console.warn(apiKey + ' token:null')
        return
    }

    if (config.requireParams) {
        for (const key of config.requireParams) {
            if (key === 'params') {
                if (
                    params == null ||
                    (typeof params === 'object' &&
                        Object.keys(params).length === 0)
                ) {
                    console.warn(apiKey + ' params required')
                    return
                }
            } else if (pathParams[key] == null || pathParams[key] === '') {
                console.warn(apiKey + ' pathParam.' + key + ' required')
                return
            }
        }
    }

    const path = resolvePath(config.path, pathParams)
    const uri = get_uri(path)

    const headers = {
        'Content-Type':
            config.contentType === 'json'
                ? 'application/json'
                : 'application/x-www-form-urlencoded',
    }
    if (config.auth && token) {
        headers['Authorization'] = 'OAuth2 ' + token
    }

    let body = ''
    if (config.body === 'params') body = params
    else if (config.body === 'data' && data !== undefined) body = data
    else if (config.body !== 'empty') body = params

    try {
        console.log(apiKey + ' ' + uri)
        const response = await axios
            .post(uri, body, { headers })
            .then((res) => res.data)
        return response
    } catch (error) {
        const msg = error.response || error
        console.debug(apiKey + ' error:', error)
        if (config.throwOnError !== false) throw msg
        return null
    }
}

// ——— 以下为基于配置的 API 封装，保持原有调用签名 ———

async function get_system_info() {
    return waveRequest('get_system_info', {})
}

async function get_current_ranks() {
    return waveRequest('get_current_ranks', {})
}

async function get_history_ranks() {
    return waveRequest('get_history_ranks', {})
}

async function login(token, address) {
    const data = WAVE_API_CONFIG.login.dataFrom(address)
    return waveRequest('login', { token, data })
}

async function get_user_info(token) {
    return waveRequest('get_user_info', { token })
}

async function get_twitter_info(tsn) {
    return waveRequest('get_twitter_info', { pathParams: { tsn } })
}

async function post_bind_twitter(token) {
    return waveRequest('post_bind_twitter', { token })
}

async function post_bind_code(token, invite_code) {
    const data = WAVE_API_CONFIG.post_bind_code.dataFrom(invite_code)
    return waveRequest('post_bind_code', { token, data })
}

async function get_rank_reward(token) {
    return waveRequest('get_rank_reward', { token })
}

async function claim_rank_reward(token, params) {
    return waveRequest('claim_rank_reward', { token, params })
}

async function product_check_tsn(token, tsn) {
    const data = WAVE_API_CONFIG.product_check_tsn.dataFrom(tsn)
    return waveRequest('product_check_tsn', { token, data })
}

async function product_create(token, data) {
    return waveRequest('product_create', { token, data })
}

async function get_product_list(token, params) {
    return waveRequest('get_product_list', { token, params })
}

async function get_mycreator_list(token) {
    return waveRequest('get_mycreator_list', { token })
}

async function get_product_info(token, mint) {
    if (mint == null || (typeof mint === 'string' && mint.length === 0)) {
        console.warn('get_product_info error mint:' + mint)
        return
    }
    return waveRequest('get_product_info', { token, pathParams: { mint } })
}

async function claim_product_reward(token, params) {
    return waveRequest('claim_product_reward', { token, params })
}

async function product_create_ex(token, data) {
    // 扩展创建接口占位，在 wave.api.config.js 中增加 product_create_ex 配置后即可启用
    if (!WAVE_API_CONFIG.product_create_ex) return undefined
    return waveRequest('product_create_ex', { token, data })
}

// ——— MQTT 实时 Winner 列表 ———
const WINNERS_TOPIC = 'winners'
// (typeof import.meta !== 'undefined' &&
//     import.meta.env?.VITE_MQTT_WINNERS_TOPIC) ||
// 'ranking/winners' ||
// 'winners'

/**
 * 将后端/MQTT 单条数据规范为 Winner 展示格式
 * @param {Object} raw - 可能含 round, address, prize, reward_time / rewardTime 等
 * @returns {{ round: number, address: string, prize: string, rewardTime: string }}
 */
function normalizeWinner(raw) {
    if (!raw || typeof raw !== 'object') return null
    const round = Number(raw.round ?? raw.rank ?? 0)
    const address =
        (raw.address ??
            raw.wallet ??
            (typeof raw.address_short === 'string' ? raw.address_short : '')) ||
        ''
    const prize =
        (raw.prize ??
            raw.reward ??
            (raw.amount != null
                ? `$${Number(raw.amount).toLocaleString()}`
                : '')) ||
        '$0'
    const rewardTime =
        (raw.rewardTime ??
            raw.reward_time ??
            raw.reward_time_str ??
            (raw.ts
                ? new Date(raw.ts)
                      .toLocaleString('sv-SE')
                      .slice(0, 16)
                      .replace('T', ' ')
                : '')) ||
        ''
    return { round, address, prize, rewardTime }
}

/**
 * 解析 MQTT 消息为 Winner 数组（支持整表或单条新增）
 * @param {Buffer|string} payload
 * @returns {{ list: Array, prepend: boolean }} list 为规范后的 Winner 列表，prepend 表示是否应拼接到现有列表前
 */
function parseWinnersPayload(payload) {
    let data
    try {
        const raw =
            typeof payload === 'string'
                ? payload
                : payload && typeof payload.toString === 'function'
                ? payload.toString()
                : ''
        data = raw ? JSON.parse(raw) : null
        console.log('parseWinnersPayload data:', data)
    } catch (_) {
        return { list: [], prepend: false }
    }
    if (!data || typeof data !== 'object') return { list: [], prepend: false }
    // 整表：{ winners: [...] } 或 { list: [...] } 或直接数组
    const list = Array.isArray(data)
        ? data
        : Array.isArray(data.winners)
        ? data.winners
        : Array.isArray(data.list)
        ? data.list
        : Array.isArray(data.ranking)
        ? data.ranking
        : []
    if (list.length > 0) {
        const normalized = list.map(normalizeWinner).filter(Boolean)
        return { list: normalized, prepend: false }
    }
    // 单条新增：{ round, address, prize, rewardTime } 等
    const one = normalizeWinner(data)
    if (one) return { list: [one], prepend: true }
    return { list: [], prepend: false }
}

/**
 * 通过 MQTT 订阅 Winner 列表的实时更新（使用 mqtt.connect）
 * @param {(winners: Array<{ round: number, address: string, prize: string, rewardTime: string }>, prepend: boolean) => void} onWinners - 收到消息时回调，prepend 为 true 表示单条应插入到列表前
 * @returns {() => void} 取消订阅函数
 */
function subscribeWinnersMQTT(onWinners) {
    const wsUrl = 'ws://broker.emqx.io:8083/mqtt'
    //typeof import.meta !== 'undefined' && import.meta.env?.VITE_MQTT_WS_URL
    if (!wsUrl) {
        console.warn(
            'subscribeWinnersMQTT: VITE_MQTT_WS_URL not set, skip MQTT'
        )
        return () => {}
    }
    if (!onWinners || typeof onWinners !== 'function') return () => {}
    const client = mqtt.connect(wsUrl, {
        clientId: 'mqttx_' + Math.random().toString(36).substring(2, 15),
        keepalive: 60,
        clean: false,
        connectTimeout: 10000,
    })

    client.on('connect', () => {
        console.log('MQTT connected')
        client.subscribe(WINNERS_TOPIC, { qos: 0 }, (err) => {
            if (err) console.warn('MQTT subscribe error:', err)
        })
    })
    client.on('message', (topic, payload) => {
        console.log('MQTT message:', topic, payload)
        if (onWinners) {
            const { list, prepend } = parseWinnersPayload(payload)
            if (list.length) onWinners(list, prepend)
        }
    })
    client.on('error', (err) => console.warn('MQTT error:', err))

    return () => {
        try {
            client.end(true)
        } catch (_) {}
    }
}

export default {
    get_system_info,
    get_current_ranks,
    get_history_ranks,
    login,
    get_user_info,
    post_bind_twitter,
    post_bind_code,
    claim_rank_reward,
    get_rank_reward,
    get_twitter_info,
    product_check_tsn,
    product_create,
    get_product_info,
    get_product_list,
    get_mycreator_list,
    product_create_ex,
    claim_product_reward,
    subscribeWinnersMQTT,
    normalizeWinner,
}

export { waveRequest, WAVE_API_CONFIG, subscribeWinnersMQTT, normalizeWinner }
