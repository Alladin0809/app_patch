'use strict'

/**
 * Wave API 业务配置
 * 通过修改此配置即可增删改接口，无需改动请求逻辑
 *
 * 配置项说明：
 * - path: 接口路径（不含 baseUrl），占位符用 :name 表示，如 /1/twitter/info/:tsn
 * - auth: 是否需要在 Header 中携带 Authorization (OAuth2 token)
 * - contentType: 'form' | 'json'
 * - body: 'empty' | 'params' | 'data' — 空体 / 用调用时 params 作为 body / 用 data 作为 body
 * - pathParams: 路径参数名数组，用于替换 path 中的 :name，与调用时传入的 pathParams 对象对应
 * - requireToken: 为 true 时，未传 token 会直接 return，不发起请求
 * - requireParams: 参数名数组，缺失时仅 warn 并 return（可选）
 * - throwOnError: 为 false 时请求失败返回 null 而不 throw（可选，默认 true）
 * - dataFrom: 函数，用于从业务参数生成 body（如 (invite_code) => ({ invitation_code })）（可选）
 */
/**
 * API 配置与 api.md 对应：
 * - System: /1/system/info
 * - User: /1/user/login, /1/user/info, /1/user/prize/claim
 * - Product: /product/create_ex (Admin OAuth2)
 */
export const WAVE_API_CONFIG = {
    // System — no auth
    system_info: {
        path: '/1/system/info',
        auth: false,
        contentType: 'json',
        body: 'empty',
        pathParams: [],
    },
    // User — OAuth2 privy_access_token
    user_login: {
        path: '/1/user/login',
        auth: true,
        contentType: 'json',
        body: 'data',
        pathParams: [],
        requireToken: true,
        requireParams: [],
    },
    user_info: {
        path: '/1/user/info',
        auth: true,
        contentType: 'json',
        body: 'empty',
        pathParams: [],
        requireToken: true,
    },
    user_prize_claim: {
        path: '/1/user/prize/claim',
        auth: true,
        contentType: 'json',
        body: 'empty',
        pathParams: [],
        requireToken: true,
    },
    // Product — Admin OAuth2
    product_create_ex: {
        path: '/product/create_ex',
        auth: true,
        contentType: 'json',
        body: 'data',
        pathParams: [],
        requireToken: true,
        requireParams: ['data'],
    },
}
