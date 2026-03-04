'use strict'
import axios, { setCookie, getCookie } from './web/lib.http.js'

const get_uri = (path) => {
    return import.meta.env.VITE_AGENT_API_URL + path
}

async function get_system_info() {
    let uri = get_uri('/1/system/info')
    try {
        //console.log('get_system_info ' + uri)
        const response = await axios
            .post(uri, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        console.debug('get_system_info error:' + error)
        throw error.response || error
    }
}

async function get_current_ranks() {
    let uri = get_uri('/1/ranking/list')
    try {
        console.log('get_current_ranks ' + uri)
        const response = await axios
            .post(uri, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        console.debug('get_current_ranks error:' + error)
        throw error.response || error
    }
}

async function get_history_ranks() {
    let uri = get_uri('/1/ranking/history')
    try {
        console.log('get_history_ranks ' + uri)
        const response = await axios
            .post(uri, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        console.debug('get_history_ranks error:' + error)
        throw error.response || error
    }
}

async function login(token, address) {
    let uri = get_uri('/1/user/login')

    if (!token) {
        console.warn('login  token:null')
        return
    }

    let data = {
        wallet: address,
    }

    try {
        const response = await axios
            .post(uri, data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'OAuth2 ' + token,
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        console.error('login error:' + error)
        throw error.response || error
    }
}

async function get_user_info(token) {
    let uri = get_uri('/1/user/info')

    console.log('get_user_info ')
    if (!token) {
        console.warn('get_user_info  token:null')
        return
    }

    try {
        const response = await axios
            .post(uri, '', {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: 'OAuth2 ' + token,
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        console.error('get_user_info error:' + error)
        throw error.response || error
    }
}

async function get_twitter_info(tsn) {
    let uri = get_uri('/1/twitter/info/' + tsn)

    console.log('get_twitter_info tsn:' + tsn)

    try {
        const response = await axios
            .post(uri, '', {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    // 'Authorization': 'OAuth2 ' + token,
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        console.error('get_user_info error:' + error)
        throw error.response || error
    }
}

async function post_bind_twitter(token) {
    let uri = get_uri('/1/user/bind/twitter')

    console.log('post_bind_twitter')
    if (!token) {
        console.warn('post_bind_twitter  token:null')
        return
    }

    try {
        const response = await axios
            .post(uri, '', {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: 'OAuth2 ' + token,
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        console.error('post_bind_twitter error:' + error)
        throw error.response || error
    }
}

async function post_bind_code(token, invite_code) {
    let uri = get_uri('/1/user/bind/invitation_code')

    console.log('post_bind_code code:' + invite_code)
    if (!token || invite_code == '') {
        console.warn(`post_bind_code  token${token},code:${invite_code}`)
        return
    }

    let data = {
        invitation_code: invite_code,
    }

    try {
        const response = await axios
            .post(uri, data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'OAuth2 ' + token,
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        console.error('post_bind_code error:' + error)
        throw error.response || error
    }
}

async function get_rank_reward(token) {
    let uri = get_uri('/1/ranking/reward')

    console.log('get_rank_reward')
    if (!token) {
        console.warn('get_rank_reward  token:null')
        return
    }

    try {
        const response = await axios
            .post(uri, '', {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: 'OAuth2 ' + token,
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        console.error('get_rank_reward error:' + error)
        throw error.response || error
    }
}

async function claim_rank_reward(token, params) {
    let uri = get_uri('/1/ranking/claim')

    console.log('claim_rank_reward')
    if (!token) {
        console.warn('claim_rank_reward  token:null')
        return
    }

    try {
        const response = await axios
            .post(uri, params, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'OAuth2 ' + token,
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        console.error('claim_rank_reward error:' + error)
        throw error.response || error
    }
}

async function product_check_tsn(token, tsn) {
    let uri = get_uri('/1/product/check')

    console.log('product_check_tsn')
    if (!token) {
        console.warn('product_check_tsn  token:null')
        return
    }

    let data = {
        twitter_screenname: tsn,
    }

    try {
        const response = await axios
            .post(uri, data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'OAuth2 ' + token,
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        console.error('product_check_tsn error:' + error)
        throw error.response || error
    }
}

async function product_create(token, data) {
    let uri = get_uri('/1/product/create')

    console.log('product_create token:' + token)

    if (!token) {
        console.warn('product_create  token:null')
        return
    }

    try {
        const response = await axios
            .post(uri, data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'OAuth2 ' + token,
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        console.error('product_create error:' + error)
        throw error.response || error
    }
}

async function get_product_list(token, params) {
    let uri = get_uri('/1/product/list')
    console.log('get_product_list params:' + JSON.stringify(params))
    try {
        const response = await axios
            .post(uri, params, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        return null
    }
}

async function get_mycreator_list(token) {
    let uri = get_uri('/1/user/create/list')
    console.log('get_mycreator_list')

    if (!token) {
        console.warn('get_mycreator_list  token:null')
        return
    }

    try {
        const response = await axios
            .post(uri, '', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'OAuth2 ' + token,
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        return null
    }
}

async function get_product_info(token, mint) {
    let uri = ''
    if (mint == null || mint.lenght == 0) {
        console.warn('get_product_info error mint:' + mint)
        return
    }

    uri = get_uri('/1/product/info/' + mint)
    console.log('get_product_info mint:' + mint)

    try {
        const response = await axios
            .post(uri, '', {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: 'OAuth2 ' + token,
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        throw error.response || error
    }
}

async function claim_product_reward(token, params) {
    let uri = ''
    if (params == null) {
        console.warn('claim_product_reward params errors')
        return
    }

    uri = get_uri('/1/product/claim')
    console.log('claim_product_reward')

    try {
        const response = await axios
            .post(uri, params, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'OAuth2 ' + token,
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        throw error.response || error
    }
}

async function claim_user_reward(token, params) {
    let uri = ''
    if (params == null) {
        console.warn('claim_user_reward params errors')
        return
    }

    uri = get_uri('/1/user/claim')
    console.log('claim_user_reward')

    try {
        const response = await axios
            .post(uri, params, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'OAuth2 ' + token,
                },
            })
            .then((res) => res.data)
        return response
    } catch (error) {
        throw error.response || error
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
    claim_user_reward,
    claim_product_reward,
}
