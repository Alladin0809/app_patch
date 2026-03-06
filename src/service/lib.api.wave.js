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

    let body = undefined
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

// ——— 以下为基于 api.md 的 API 封装 ———

/** GET System Info — POST /1/system/info, no auth */
async function get_system_info() {
    return waveRequest('system_info', {})
}

/** User Login — POST /1/user/login, body: { wallet } */
async function login(token, walletAddress) {
    return waveRequest('user_login', { token, data: { wallet: walletAddress } })
}

/** Get User Info — POST /1/user/info, returns { code, rounds } */
async function get_user_info(token) {
    return waveRequest('user_info', { token })
}

/** Claim Prize — POST /1/user/prize/claim, returns { code, base64_transaction, balance } */
async function claim_prize(token) {
    return waveRequest('user_prize_claim', { token })
}

/** Create Product (Extended) — POST /product/create_ex, Admin auth, body: { logo, name, symbol, ipfs_url } */
async function product_create_ex(token, data) {
    if (!WAVE_API_CONFIG.product_create_ex) return undefined
    return waveRequest('product_create_ex', { token, data })
}

/** Claim product reward — POST /1/product/claim */
async function claim_product_reward(token, params) {
    return waveRequest('claim_product_reward', { token, params })
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
function subscribeWinnersMQTT(userid, onWinners) {
    const WINNERS_TOPIC3 = 'system/pve_round'
    const WINNERS_TOPIC2 = 'system/product'
    const WINNERS_TOPIC1 = 'system/' + userid + '/info'
    const WINNERS_TOPIC4 = 'system/' + userid + '/red'
    const WINNERS_TOPIC5 = 'system/' + userid + '/contribution'
    //const wsUrl = 'ws://broker.emqx.io:8083/mqtt'
    const wsUrl = import.meta.env.VITE_MQTT_WS_URL //'wss://horsesaga-mqtt.1033360899.dpdns.org/mqtt/'
    //const wsUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MQTT_WS_URL !== undefined) ? import.meta.env.VITE_MQTT_WS_URL : 'ws://broker.emqx.io:8083/mqtt'
    console.log('subscribeWinnersMQTT wsUrl:', wsUrl)

    if (!onWinners || typeof onWinners !== 'function') return () => { }
    if (!wsUrl) {
        console.warn(
            'subscribeWinnersMQTT: VITE_MQTT_WS_URL not set, skip MQTT'
        )
        return () => { }
    }

    // 如果已经连接，直接使用现有连接并订阅主题
    if (mqttClient && mqttClient.connected) {
        console.log('MQTT already connected, reusing connection')
        mqttClient.subscribe(WINNERS_TOPIC1, { qos: 0 }, (err) => {
            if (err) console.warn('MQTT subscribe error:', err)
        })
        mqttClient.subscribe(WINNERS_TOPIC2, { qos: 0 }, (err) => {
            if (err) console.warn('MQTT subscribe error:', err)
        })
        mqttClient.subscribe(WINNERS_TOPIC3, { qos: 0 }, (err) => {
            if (err) console.warn('MQTT subscribe error:', err)
        })

        mqttClient.subscribe(WINNERS_TOPIC4, { qos: 0 }, (err) => {
            if (err) console.warn('MQTT subscribe error:', err)
        })
        mqttClient.subscribe(WINNERS_TOPIC5, { qos: 0 }, (err) => {
            if (err) console.warn('MQTT subscribe error:', err)
        })
        console.log('MQTT subscribe:', WINNERS_TOPIC1, WINNERS_TOPIC2, WINNERS_TOPIC3, WINNERS_TOPIC4, WINNERS_TOPIC5)
        return () => {
            try {
                console.log('MQTT unsubscribe:', WINNERS_TOPIC1, WINNERS_TOPIC2, WINNERS_TOPIC3)
                mqttClient.unsubscribe(WINNERS_TOPIC1, (err) => {
                    if (err) console.warn('MQTT unsubscribe error:', err)
                })
                mqttClient.unsubscribe(WINNERS_TOPIC2, (err) => {
                    if (err) console.warn('MQTT unsubscribe error:', err)
                })
                mqttClient.unsubscribe(WINNERS_TOPIC3, (err) => {
                    if (err) console.warn('MQTT unsubscribe error:', err)
                })
                mqttClient.unsubscribe(WINNERS_TOPIC4, (err) => {
                    if (err) console.warn('MQTT unsubscribe error:', err)
                })
                mqttClient.unsubscribe(WINNERS_TOPIC5, (err) => {
                    if (err) console.warn('MQTT unsubscribe error:', err)
                })
            } catch (_) { }
        }
    } else {
        console.log('MQTT not connected, creating new connection')
    }
    // 如果未连接，创建新连接
    const client = mqtt.connect(wsUrl, {
        clientId: 'mqttx_' + userid,//Math.random().toString(36).substring(2, 15),
        username: "Happy New Year",
        password: "Happy New Year",
        keepalive: 60,
        clean: false,
        connectTimeout: 10000,
    })

    // 保存客户端实例
    mqttClient = client

    client.on('connect', () => {
        console.log('MQTT connected')
        client.subscribe(WINNERS_TOPIC1, { qos: 0 }, (err) => {
            if (err) console.warn('MQTT subscribe error:', err)
        })
        client.subscribe(WINNERS_TOPIC2, { qos: 0 }, (err) => {
            if (err) console.warn('MQTT subscribe error:', err)
        })
        client.subscribe(WINNERS_TOPIC3, { qos: 0 }, (err) => {
            if (err) console.warn('MQTT subscribe error:', err)
        })

        client.subscribe(WINNERS_TOPIC4, { qos: 0 }, (err) => {
            if (err) console.warn('MQTT subscribe error:', err)
        })
        client.subscribe(WINNERS_TOPIC5, { qos: 0 }, (err) => {
            if (err) console.warn('MQTT subscribe error:', err)
        })

        console.log('MQTT subscribe:', WINNERS_TOPIC1, WINNERS_TOPIC2, WINNERS_TOPIC3, WINNERS_TOPIC4, WINNERS_TOPIC5)
        client.on('message', (topic, payload) => {

            const data = parseWinnersPayload(payload)
            if (!onWinners) {
                console.warn('MQTT onWinners: not set')
                return
            }

            if (topic === WINNERS_TOPIC1) {
                console.log('MQTT message:', topic, data)
                onWinners(data, null, null, null, null)
            }
            if (topic === WINNERS_TOPIC2) {
                console.log('MQTT message:', topic, data)
                onWinners(null, data, null, null, null)
            }
            if (topic === WINNERS_TOPIC3) {
                console.log('MQTT message:', topic, data)
                onWinners(null, null, data, null, null)
            }
            if (topic === WINNERS_TOPIC4) {
                console.log('MQTT message:', topic, data)
                onWinners(null, null, null, data, null)
            }
            if (topic === WINNERS_TOPIC5) {
                console.log('MQTT message:', topic, data)
                onWinners(null, null, null, null, data)
            }
            // if (onWinners) {
            //     const { list, prepend } = parseWinnersPayload(payload)
            //     if (list.length) (list, prepend)
            // }
        })

        client.on('error', (err) => console.warn('MQTT error:', err))
    })

    // 处理连接断开，清除客户端实例
    client.on('close', () => {
        console.log('MQTT connection closed')
        if (mqttClient === client) {
            mqttClient = null
        }
    })

    client.on('offline', () => {
        console.log('MQTT client offline')
        if (mqttClient === client) {
            mqttClient = null
        }
    })

    return () => {
        try {
            console.log('MQTT unsubscribe:', WINNERS_TOPIC1, WINNERS_TOPIC2, WINNERS_TOPIC3)
            if (client && client.connected) {
                client.unsubscribe(WINNERS_TOPIC1, (err) => {
                    if (err) console.warn('MQTT unsubscribe error:', err)
                })
                client.unsubscribe(WINNERS_TOPIC2, (err) => {
                    if (err) console.warn('MQTT unsubscribe error:', err)
                })
                client.unsubscribe(WINNERS_TOPIC3, (err) => {
                    if (err) console.warn('MQTT unsubscribe error:', err)
                })
                client.unsubscribe(WINNERS_TOPIC4, (err) => {
                    if (err) console.warn('MQTT unsubscribe error:', err)
                })
                client.unsubscribe(WINNERS_TOPIC5, (err) => {
                    if (err) console.warn('MQTT unsubscribe error:', err)
                })
            }
        } catch (_) { }
    }
}

export default {
    get_system_info,
    login,
    get_user_info,
    claim_prize,
    product_create_ex,
    claim_product_reward,
    subscribeWinnersMQTT,
    normalizeWinner,
}

export {
    waveRequest,
    WAVE_API_CONFIG,
    get_system_info,
    login,
    get_user_info,
    claim_prize,
    subscribeWinnersMQTT,
    normalizeWinner,
}
