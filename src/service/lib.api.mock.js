'use strict'

const MOCK_DELAY_MS = 500
const delay = () => new Promise((r) => setTimeout(r, MOCK_DELAY_MS))

// ——— 共享假数据（与后端结构一致） ———
const MOCK_CREATOR = {
    id: 88,
    privy_device_id: 'did:privy:cmkicvjs300dxla0b9o3mgz0p',
    extra: { score: 100, rank: 18 },
    twitter_extra: {
        avatar: 'https://pbs.twimg.com/profile_images/1967001582874324992/ZCIIATfD_normal.jpg',
        name: 'Alladin',
        bio: 'Web3 x AI builder | Launching ideas faster than my coffee cools ☕️🚀',
        followers_count: 1663,
        create_time: 0,
    },
    invitation_code: '6DMJ',
    parent_invitation_code: 'KW5C',
    twitter_screenname: 'AlladinMagic123',
    ctime: '2026-01-21T15:37:15+08:00',
    mtime: '2026-01-23T18:52:20+08:00',
}

const MOCK_RANKING_ITEMS = [
    {
        id: 1,
        ...MOCK_CREATOR,
        extra: { score: 12500, rank: 1 },
        twitter_extra: {
            ...MOCK_CREATOR.twitter_extra,
            followers_count: 50000,
        },
    },
    {
        id: 2,
        ...MOCK_CREATOR,
        extra: { score: 9800, rank: 2 },
        twitter_screenname: 'WaveBuilder2',
        twitter_extra: {
            avatar: 'https://pbs.twimg.com/profile_images/2008546467615580160/57KcqsTA_normal.jpg',
            name: 'Wave Builder',
            followers_count: 12000,
        },
    },
    {
        id: 3,
        ...MOCK_CREATOR,
        extra: { score: 7600, rank: 3 },
        twitter_screenname: 'SolanaFan',
        twitter_extra: {
            name: 'Solana Fan',
            followers_count: 8000,
        },
    },
]

const MOCK_PRODUCT_ITEM = (overrides = {}) => ({
    id: 22,
    uid: 88,
    screenname: 'AlladinMagic123',
    mint: 'dBj4Ef3gL6f3ZizNDH1zyfqKN48AqCLvVfWjKWvwave',
    ticker: 'ALLADINMAG',
    ipfs_url:
        'https://makewave.mypinata.cloud/ipfs/QmS2GaRn6bXYsoQTPWhwQChZzkH4asQciHkseSRNwj3AQE',
    extra: {
        logo: 'https://makewave.mypinata.cloud/ipfs/QmSTiKt38zxVAGNR5z9KVZfXAqwpJrze2AyqYrE8kZHYss',
        name: 'Alladin',
        symbol: 'ALLADINMAG',
        ipfs_url:
            'https://makewave.mypinata.cloud/ipfs/QmS2GaRn6bXYsoQTPWhwQChZzkH4asQciHkseSRNwj3AQE',
        creator_pubkey: 'CvT68KtLAHKBXLgRWzSro5NjJGhBKys1AHvVyDFTB6DK',
        wallet_pubkey: 'FbHmVjUfWqE7yeJbf1K2gVhJCbn34U6B3as9xAm9sFxV',
        twitter_screenname: 'AlladinMagic123',
        twitter_avatar:
            'https://pbs.twimg.com/profile_images/1967001582874324992/ZCIIATfD_normal.jpg',
        twitter_name: 'Alladin',
        twitter_bio: 'Web3 x AI builder.',
        followers_count: 1663,
        is_show_icon: true,
        is_verified: false,
        is_claimed: false,
    },
    price: '0.000000546',
    product_fee: 500_000_00,
    creator_fee: 500_000_00,
    status: 0,
    process: '0.0001',
    ctime: '2026-01-23T18:56:20+08:00',
    mtime: '2026-01-23T18:56:20+08:00',
    creator: MOCK_CREATOR,
    ...overrides,
})

async function get_system_info() {
    const result = {
        code: 200,
        name: 'makewave-mock',
        version: '1.0.0',
        env: 'development',
    }
    await delay()
    return result
}

async function get_current_ranks() {
    const result = { code: 200, ranking: MOCK_RANKING_ITEMS }
    await delay()
    return result
}

async function get_history_ranks() {
    const result = { code: 200, ranking: MOCK_RANKING_ITEMS.slice(0, 2) }
    await delay()
    return result
}

async function login(token) {
    if (!token) {
        await delay()
        return { code: 400, message: 'token required' }
    }
    const result = {
        code: 200,
        user: {
            id: 88,
            privy_device_id: 'did:privy:cmkicvjs300dxla0b9o3mgz0p',
            extra: { score: 100, rank: 18 },
            twitter_extra: {
                avatar: 'https://pbs.twimg.com/profile_images/1967001582874324992/ZCIIATfD_normal.jpg',
                name: 'Alladin',
                bio: 'Web3 x AI builder.',
                followers_count: 1663,
                create_time: 0,
            },
            invitation_code: '6DMJ',
            parent_invitation_code: 'KW5C',
            twitter_screenname: 'AlladinMagic123',
            ctime: '2026-01-21T15:37:15+08:00',
            mtime: '2026-01-23T18:52:20+08:00',
        },
    }
    await delay()
    return result
}

async function get_user_info(token) {
    let user = {
        code: 200,
        is_new: false,
        user: {
            privy_device_id: 'did:privy:cmkicvjs300dxla0b9o3mgz0p',
            extra: {
                score: 100,
                rank: 18,
            },
            twitter_extra: {
                avatar: 'https://pbs.twimg.com/profile_images/1967001582874324992/ZCIIATfD_normal.jpg',
                name: 'Alladin',
                bio: 'Web3 x AI builder | Launching ideas faster than my coffee cools ☕️🚀 @Solana contract \u0026 @MeteoraAG Launchpad dev \u0026 x402.🛠 Alpha Meme sniper',
                followers_count: 1663,
                create_time: 0,
            },
            invitation_code: '6DMJ',
            parent_invitation_code: 'KW5C',
            twitter_screenname: 'AlladinMagic123',
            ctime: '2026-01-21T15:37:15+08:00',
            mtime: '2026-01-23T18:52:20.368518081+08:00',
        },
        product: {
            screenname: 'AlladinMagic123',
            mint: 'dBj4Ef3gL6f3ZizNDH1zyfqKN48AqCLvVfWjKWvwave',
            ticker: 'ALLADINMAG',
            ipfs_url:
                'https://makewave.mypinata.cloud/ipfs/QmS2GaRn6bXYsoQTPWhwQChZzkH4asQciHkseSRNwj3AQE',
            extra: {
                logo: 'https://makewave.mypinata.cloud/ipfs/QmSTiKt38zxVAGNR5z9KVZfXAqwpJrze2AyqYrE8kZHYss',
                name: 'Alladin',
                symbol: 'ALLADINMAG',
                ipfs_url:
                    'https://makewave.mypinata.cloud/ipfs/QmS2GaRn6bXYsoQTPWhwQChZzkH4asQciHkseSRNwj3AQE',
                twitter_screenname:
                    '6Ym7MdhmSbS53EJN4E1Xn6YwL2jbQMCfVdMTHYH1GomV',
                twitter_avatar: '',
                twitter_name: '',
                twitter_bio: '',
                followers_count: 0,
                is_show_icon: false,
                is_verified: false,
                is_claimed: false,
            },
            price: '0.000000546',
            product_fee: 500_000_00,
            creator_fee: 500_000_00,
            status: 0,
            process: 0,
        },
    }

    await delay()
    return user
}

async function get_twitter_info(tsn) {
    const result = {
        code: 200,
        name: tsn ? `MockUser_${tsn}` : 'Mock User',
        avatar: 'https://pbs.twimg.com/profile_images/2008546467615580160/57KcqsTA_normal.jpg',
        bio: 'Mock Twitter bio for ' + (tsn || 'user'),
        followers_count: 10000,
        screenname: tsn || 'mockuser',
    }
    await delay()
    return result
}

async function post_bind_twitter(token) {
    if (!token) {
        await delay()
        return { code: 401, message: 'token required' }
    }
    await delay()
    return { code: 200, message: 'twitter bound' }
}

async function post_bind_code(token, invite_code) {
    if (!token || !invite_code) {
        await delay()
        return { code: 400, message: 'token and invite_code required' }
    }
    await delay()
    return { code: 200, message: 'invitation code bound' }
}

async function get_rank_reward(token) {
    if (!token) {
        await delay()
        return { code: 401, message: 'token required' }
    }
    const result = {
        code: 200,
        balance: 1_500_000_000,
        user: { state: 0 },
    }
    await delay()
    return result
}

async function claim_rank_reward(token, params) {
    if (!token) {
        await delay()
        return { code: 401, message: 'token required' }
    }
    const result = { code: 200, balance: 1_500_000_000 }
    await delay()
    return result
}

async function product_check_tsn(token, tsn) {
    let data = {
        avatar: 'https://pbs.twimg.com/profile_images/2008546467615580160/57KcqsTA_normal.jpg',
        bio: 'musk is a man',
        code: 200,
        followers_count: 232836436,
        name: 'Elon Musk',
    }

    await delay()
    return data
}

async function product_create(token, data) {
    console.log('product_create data:' + JSON.stringify(data))
    let prod = {
        code: 200,
        product: {
            id: 22,
            uid: 88,
            screenname: 'ChrisEgan5',
            mint: '5P2YHGtVFfoMf7iRBaR7m6YoqQJCjpYQAgizHGeowave',
            ticker: 'CHRISEGAN5',
            ipfs_url:
                'https://makewave.mypinata.cloud/ipfs/QmTfF9pE3WJrRP31PaGxBVFjWsdKKhcRm9tFUVkRufoQtf',
            extra: {
                logo: 'https://pbs.twimg.com/profile_images/1230242465803718657/kkUuaGUp_400x400.jpg',
                name: 'Chris Egan King-5 TV',
                symbol: 'CHRISEGAN5',
                ipfs_url:
                    'https://makewave.mypinata.cloud/ipfs/QmTfF9pE3WJrRP31PaGxBVFjWsdKKhcRm9tFUVkRufoQtf',
                creator_pubkey: 'CvT68KtLAHKBXLgRWzSro5NjJGhBKys1AHvVyDFTB6DK',
                wallet_pubkey: 'FbHmVjUfWqE7yeJbf1K2gVhJCbn34U6B3as9xAm9sFxV',
                twitter_screenname: 'ChrisEgan5',
                twitter_avatar:
                    'https://pbs.twimg.com/profile_images/1230242465803718657/kkUuaGUp_normal.jpg',
                twitter_name: 'Chris Egan King-5 TV',
                twitter_bio:
                    'Emmy-Murrow Award winning KING TV Sports Reporter-Anchor/Covers Seahawks,Sounders, Mariners,Storm,Kraken, Huskies,Cougars, Preps, Olympics, 🎾 n #pickleball',
                followers_count: 40483,
                is_show_icon: true,
                is_verified: false,
                is_claimed: false,
            },
            pre_buy_amount: 0,
            price: '0.00000002',
            product_fee: 0,
            creator_fee: 0,
            status: 0,
            process: '0.0001',
            process_values: '0',
            ctime: '2026-02-01T17:28:36.014438933+08:00',
            mtime: '2026-02-01T17:28:36.014438933+08:00',
            creator: {
                id: 88,
                privy_device_id: 'did:privy:cmkicvjs300dxla0b9o3mgz0p',
                extra: {
                    score: 100,
                    rank: 18,
                },
                twitter_extra: {
                    id: '',
                    avatar: 'https://pbs.twimg.com/profile_images/1967001582874324992/ZCIIATfD_normal.jpg',
                    name: 'Alladin',
                    bio: 'Web3 x AI builder | Launching ideas faster than my coffee cools ☕️🚀 @Solana contract \u0026 @MeteoraAG Launchpad dev \u0026 x402.🛠 Alpha Meme sniper',
                    followers_count: 1663,
                    create_time: 0,
                },
                invitation_code: '6DMJ',
                parent_invitation_code: 'KW5C',
                twitter_screenname: 'AlladinMagic123',
                ctime: '2026-01-21T15:37:15+08:00',
                mtime: '2026-01-27T20:11:53+08:00',
            },
        },
        tx_base64:
            'AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADsq2ZOXo8DMqgWx78s1ksQcc+ukQ6LkWhwY1Rza+1XXCY9N+jAU6VyQT5r61tmnBQy2iP24Ao2HBp5sNGJjw8AAgAIDlJtUIgPVxx1m68wGcJEU4G+kyPtycebIjsjQ/VFB8SkQRNEGeat7LEiLViYOk7F9u4fQSD/SxH+pMNeiBYzl/u7o1jPIrJG2j2TygWIuCga33nmq51WC9Mr/oXvxF7iwpS135BeoRXojzcXlSGkCmVv7/u46B9gQ36LRN8Cv3W5MtnleHLuidK3uBLglxziJynLeeCwiwyLK/GGZV3QxV0NujjKFRqEScsvLdSqjHXhQbJXZxGa8V/JHa7tuMe5VsV1TF2BLHKoQGGsNRj4mCAZWkEyfEjXBus+iBCZAzY02mNoH3KGvMgGcZ4sK1CiAVckO/yWaLEVILxThD7c2wgGm4hX/quBhPtof2NGGMA12sQ53BrrO1WYoPAAAAAAAQtwZbHj0XxFOJ1Sf2sEw81YuGxzGqD9tUm20bwD+ClGBt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGzWzIDHsAskwhAgOEM/SKoPyo7n6BkDPA/h+6co3/UMCWAMpST3sbfWzLHDlzqgMw0ZA9pgHMm13uPGYrTK0Ukq4b9rErYq3WF+IXKK4YJl9d0d+//9hndgJPbOdCiJ8wENEAYHAAEIAgMEBQkACgoLDA2FAYxV17BmNmhPFAAAAENocmlzIEVnYW4gS2luZy01IFRWCgAAAENIUklTRUdBTjVTAAAAaHR0cHM6Ly9tYWtld2F2ZS5teXBpbmF0YS5jbG91ZC9pcGZzL1FtVGZGOXBFM1dKclJQMzFQYUd4QlZGaldzZEtLaGNSbTl0RlVWa1J1Zm9RdGY=',
    }

    await delay()
    return prod
}

async function get_product_list(token, params) {
    const products = [
        MOCK_PRODUCT_ITEM({
            id: 1,
            mint: 'dBj4Ef3gL6f3ZizNDH1zyfqKN48AqCLvVfWjKWvwave',
            ticker: 'ALLADINMAG',
            extra: {
                ...MOCK_PRODUCT_ITEM().extra,
                twitter_screenname: 'AlladinMagic123',
                name: 'Alladin',
                symbol: 'ALLADINMAG',
            },
        }),
        MOCK_PRODUCT_ITEM({
            id: 2,
            mint: '5P2YHGtVFfoMf7iRBaR7m6YoqQJCjpYQAgizHGeowave',
            ticker: 'CHRISEGAN5',
            screenname: 'ChrisEgan5',
            extra: {
                ...MOCK_PRODUCT_ITEM().extra,
                twitter_screenname: 'ChrisEgan5',
                name: 'Chris Egan King-5 TV',
                symbol: 'CHRISEGAN5',
                logo: 'https://pbs.twimg.com/profile_images/1230242465803718657/kkUuaGUp_400x400.jpg',
                followers_count: 40483,
            },
        }),
        MOCK_PRODUCT_ITEM({
            id: 3,
            mint: '7xY2KpWFgpNf8jScS8n7ZprrRJDrqZRBhjaHfFpxwave',
            ticker: 'MOCKTOKEN',
            screenname: 'MockCreator',
            extra: {
                ...MOCK_PRODUCT_ITEM().extra,
                twitter_screenname: 'MockCreator',
                name: 'Mock Token',
                symbol: 'MOCKTOKEN',
                followers_count: 5000,
            },
        }),
    ]
    const result = { code: 200, products, total: products.length }
    await delay()
    return result
}

async function get_product_info(token, mint) {
    console.log('get_product_info mint:' + JSON.stringify(mint))

    let prod = {
        code: 200,
        product: {
            screenname: 'AlladinMagic123',
            mint: mint,
            ticker: 'ALLADINMAG',
            ipfs_url:
                'https://makewave.mypinata.cloud/ipfs/QmS2GaRn6bXYsoQTPWhwQChZzkH4asQciHkseSRNwj3AQE',
            extra: {
                logo: 'https://makewave.mypinata.cloud/ipfs/QmSTiKt38zxVAGNR5z9KVZfXAqwpJrze2AyqYrE8kZHYss',
                name: 'Alladin',
                symbol: 'ALLADINMAG',
                ipfs_url:
                    'https://makewave.mypinata.cloud/ipfs/QmS2GaRn6bXYsoQTPWhwQChZzkH4asQciHkseSRNwj3AQE',
                twitter_screenname:
                    '6Ym7MdhmSbS53EJN4E1Xn6YwL2jbQMCfVdMTHYH1GomV',
                twitter_avatar: '',
                twitter_name: '',
                twitter_bio: '',
                followers_count: 0,
                is_show_icon: false,
                is_verified: false,
                is_claimed: false,
            },
            price: '0.000000546',
            product_fee: 500_000_00,
            creator_fee: 500_000_00,
            status: 0,
            process: 0,
            creator: {
                privy_device_id: 'did:privy:cmkicvjs300dxla0b9o3mgz0p',
                extra: {
                    score: 100,
                    rank: 18,
                },
                twitter_extra: {
                    avatar: 'https://pbs.twimg.com/profile_images/1967001582874324992/ZCIIATfD_normal.jpg',
                    name: 'Alladin',
                    bio: 'Web3 x AI builder | Launching ideas faster than my coffee cools ☕️🚀 @Solana contract \u0026 @MeteoraAG Launchpad dev \u0026 x402.🛠 Alpha Meme sniper',
                },
                invitation_code: '6DMJ',
                parent_invitation_code: 'KW5C',
                twitter_screenname: 'AlladinMagic123',
            },
        },
        tx_base64:
            'AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACe+J8y+Y5+A3CUwXOjcUbunwZ8A6CjJkPDD/zD/0a9zBm+KojMaTm3P1DfyytjOubRcK7Na0Cx4FBiiAR+xcIEAgAIDlJtUIgPVxx1m68wGcJEU4G+kyPtycebIjsjQ/VFB8SkCUUJOaFBsOTxANTuo659R3DDVmC/70qaa56BvN8hNCtos4jcGOzkHLTuOaRbC2gYeg3hAb7rmmZ31+qkcJvnNESjzX9RF7g8CsgBhv8G3HDC23UCXI4ymuvVLiHTdDC3i6ii2WTGJOrjaSZOAWiy7DYVLyWgfuTaB5o2XA1hM8Ns8mvm0pv1IavlBO2movK6xYA2ZN/0zW1dismQCyG+JOy1R/ZlP7gCgnCeVgGs8HsrgqADCd4wMHxr1myM1dlE2mNoH3KGvMgGcZ4sK1CiAVckO/yWaLEVILxThD7c2wgGm4hX/quBhPtof2NGGMA12sQ53BrrO1WYoPAAAAAAAQtwZbHj0XxFOJ1Sf2sEw81YuGxzGqD9tUm20bwD+ClGBt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGzWzIDHsAskwhAgOEM/SKoPyo7n6BkDPA/h+6co3/UMCWAMpST3sbfWzLHDlzqgMw0ZA9pgHMm13uPGYrTK0UkhFpwiri0d/DmWY0z+f5mpAyummUwACj7FEylA/HPhwwENEAYHAAEIAgMEBQkACgoLDA14jFXXsGY2aE8HAAAAQWxsYWRpbgoAAABBTExBRElOTUFHUwAAAGh0dHBzOi8vbWFrZXdhdmUubXlwaW5hdGEuY2xvdWQvaXBmcy9RbVMyR2FSbjZiWFlzb1FUUFdod1FDaFp6a0g0YXNRY2lIa3NlU1JOd2ozQVFF',
    }

    await delay()
    return prod
}

async function claim_product_reward(token, params) {
    if (!token) {
        await delay()
        return { code: 401, message: 'token required' }
    }
    const result = {
        code: 200,
        balance: 2_000_000_000,
        message: 'claimed',
    }
    await delay()
    return result
}

async function platform_mob_create(token, data) {
    if (!token) {
        await delay()
        return { code: 401, message: 'token required' }
    }
    const prod = {
        code: 200,
        product: MOCK_PRODUCT_ITEM({
            id: 99,
            uid: 88,
            screenname: data?.twitter_screenname || 'MockUser',
            mint: 'Mob' + Date.now().toString(36),
            ticker: (data?.symbol || 'MOB').slice(0, 10),
            extra: {
                ...MOCK_PRODUCT_ITEM().extra,
                name: data?.name || 'Platform Mob',
                symbol: data?.symbol || 'MOB',
                twitter_screenname: data?.twitter_screenname || 'mockuser',
                followers_count: data?.followers_count ?? 0,
            },
        }),
        tx_base64: '',
    }
    await delay()
    return prod
}

async function product_create_finish(token, mints) {
    console.log('product_create_finish mints', mints)
    await delay()
    return { code: 200, message: 'finished' }
}

async function platform_mob_create_ex(token, data) {
    if (!token) {
        await delay()
        return { code: 401, message: 'token required' }
    }
    const prod = {
        code: 200,
        product: MOCK_PRODUCT_ITEM({
            id: 100,
            ticker: (data?.symbol || 'MOBEX').slice(0, 10),
            extra: {
                ...MOCK_PRODUCT_ITEM().extra,
                name: data?.name || 'Platform Mob Ex',
                symbol: data?.symbol || 'MOBEX',
            },
        }),
        tx_base64: '',
    }
    await delay()
    return prod
}

async function product_create_ex(token, data) {
    if (!token) {
        await delay()
        return { code: 401, message: 'token required' }
    }
    const prod = {
        code: 200,
        product: MOCK_PRODUCT_ITEM({
            id: 101,
            ticker: (data?.symbol || 'EX').slice(0, 10),
            extra: {
                ...MOCK_PRODUCT_ITEM().extra,
                name: data?.name || 'Product Ex',
                symbol: data?.symbol || 'EX',
            },
        }),
        tx_base64: '',
    }
    await delay()
    return prod
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
    claim_product_reward,
    product_create_finish,
    platform_mob_create,
    platform_mob_create_ex,
    product_create_ex,
}
