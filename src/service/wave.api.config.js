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
export const WAVE_API_CONFIG = {
    get_system_info: {
        path: '/1/system/info',
        auth: false,
        contentType: 'form',
        body: 'empty',
        pathParams: [],
    },
    get_current_ranks: {
        path: '/1/ranking/list',
        auth: false,
        contentType: 'form',
        body: 'empty',
        pathParams: [],
    },
    get_history_ranks: {
        path: '/1/ranking/history',
        auth: false,
        contentType: 'form',
        body: 'empty',
        pathParams: [],
    },
    login: {
        path: '/1/user/login',
        auth: true,
        contentType: 'json',
        body: 'data',
        pathParams: [],
        requireToken: true,
        dataFrom: (address) => ({ wallet: address }),
    },
    get_user_info: {
        path: '/1/user/info',
        auth: true,
        contentType: 'form',
        body: 'empty',
        pathParams: [],
        requireToken: true,
    },
    get_twitter_info: {
        path: '/1/twitter/info/:tsn',
        auth: false,
        contentType: 'form',
        body: 'empty',
        pathParams: ['tsn'],
    },
    post_bind_twitter: {
        path: '/1/user/bind/twitter',
        auth: true,
        contentType: 'form',
        body: 'empty',
        pathParams: [],
        requireToken: true,
    },
    post_bind_code: {
        path: '/1/user/bind/invitation_code',
        auth: true,
        contentType: 'json',
        body: 'data',
        pathParams: [],
        requireToken: true,
        dataFrom: (invite_code) => ({ invitation_code: invite_code }),
    },
    get_rank_reward: {
        path: '/1/ranking/reward',
        auth: true,
        contentType: 'form',
        body: 'empty',
        pathParams: [],
        requireToken: true,
    },
    claim_rank_reward: {
        path: '/1/ranking/claim',
        auth: true,
        contentType: 'json',
        body: 'params',
        pathParams: [],
        requireToken: true,
    },
    product_check_tsn: {
        path: '/1/product/check',
        auth: true,
        contentType: 'json',
        body: 'data',
        pathParams: [],
        requireToken: true,
        dataFrom: (tsn) => ({ twitter_screenname: tsn }),
    },
    product_create: {
        path: '/1/product/create',
        auth: true,
        contentType: 'json',
        body: 'data',
        pathParams: [],
        requireToken: true,
    },
    get_product_list: {
        path: '/1/product/list',
        auth: false,
        contentType: 'json',
        body: 'params',
        pathParams: [],
        throwOnError: false,
    },
    get_mycreator_list: {
        path: '/1/user/create/list',
        auth: true,
        contentType: 'json',
        body: 'empty',
        pathParams: [],
        requireToken: true,
        throwOnError: false,
    },
    get_product_info: {
        path: '/1/product/info/:mint',
        auth: true,
        contentType: 'form',
        body: 'empty',
        pathParams: ['mint'],
        requireParams: ['mint'],
    },
    claim_product_reward: {
        path: '/1/product/claim',
        auth: true,
        contentType: 'json',
        body: 'params',
        pathParams: [],
        requireParams: ['params'],
    },
}
