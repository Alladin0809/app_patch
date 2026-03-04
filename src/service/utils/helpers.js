/*import {getChartsData} from "@/service/api.js";

export async function makeApiRequest(interval, mint, from, to) {
    let params = {
        interval: interval,
        mint: mint,
        start_time: from,
        end_time: to,
    };
    try {
        // 使用 await 确保正确的异步行为，并设置一个合理的超时时间
        return await getChartsData(params);
    } catch (error) {
        // 改进错误信息，捕获所有可能的异常情况
        console.error("API request failed", error); // 可以记录详细的错误信息用于调试
        throw new Error(`API request error: ${error.response ? error.response.status : "Network or CORS error"}`);
    }
}
*/
export const parseFullSymbol = (symbol) => {
    const [fromSymbol, toSymbol] = symbol.split(':')
    return { fromSymbol, toSymbol }
}

export function formatPrice(price) {
    if (price >= 1000000) {
        // 大于等于百万，转换为百万并加上 M
        return (price / 1000000).toFixed(2) + 'M'
    } else if (price >= 1000) {
        // 大于等于千，转换为千并加上 K
        return (price / 1000).toFixed(2) + 'K'
    } else {
        // 小于千，直接返回原始值
        return Number(price).toFixed(2).toString()
    }
}

export function formatCount(count) {
    if (count >= 1000000000) {
        return (count / 1000000000).toFixed(0) + 'B'
    } else if (count >= 1000000) {
        // 大于等于百万，转换为百万并加上 M
        return (count / 1000000).toFixed(0) + 'M'
    } else if (count >= 1000) {
        // 大于等于千，转换为千并加上 K
        return (count / 1000).toFixed(0) + 'K'
    } else {
        // 小于千，直接返回原始值
        return Number(count).toFixed(0).toString()
    }
}

export function isNull(data) {
    //null & undefine
    if (!!!data || data === undefined) return true

    return false
}

export function formatSmallPrice(num) {
    if (num == null || num == undefined) {
        return `$0.00`
    }
    // 转字符串
    let str = num.toString()

    // 只保留小数部分
    let decimal = str.split('.')[1] || ''

    // 数前导零个数
    let zeroCount = 0
    while (decimal[zeroCount] === '0') zeroCount++

    // 下标数字映射
    const subscriptMap = {
        0: '₀',
        1: '₁',
        2: '₂',
        3: '₃',
        4: '₄',
        5: '₅',
        6: '₆',
        7: '₇',
        8: '₈',
        9: '₉',
    }

    // 生成下标字符串
    const subscript = zeroCount
        .toString()
        .split('')
        .map((d) => subscriptMap[d])
        .join('')

    // 剩余数字部分
    const rest = decimal.slice(zeroCount, zeroCount + 3) // 取前三位即可

    return `$0.0${subscript}${rest}`
}

const keywords = ['fa1rtrade']
export function checkBlackListUser(user) {
    if (user == null) {
        return false
    } else {
        const matched = keywords.filter((kw) => user.includes(kw)).length
        return matched > 0
    }
}

export const formatHash = (str) => {
    // 空 & 长度不足直接返回
    if (!str || str.length <= 8) return str

    return `${str?.slice(0, 4)}...${str?.slice(-2)}`
}

export const formatHash4 = (str) => {
    // 空 & 长度不足直接返回
    if (!str || str.length <= 8) return str

    return `${str?.slice(0, 4)}...${str?.slice(-4)}`
}

export const formatHash6 = (str) => {
    // 空 & 长度不足直接返回
    if (!str || str.length <= 10) return str

    return `${str?.slice(0, 6)}...${str?.slice(-4)}`
}

async function sharePosterGen() {
    const file = await renderImage((ctx) =>
        drawOGImage(
            ctx,
            '$SUNLANA',
            'Provide a daily egg for rural children',
            defaultlogo
        )
    )
    downloadFile('BANNER.png', file)
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()

    // 清理对象 URL 和 DOM
    URL.revokeObjectURL(link.href)
    document.body.removeChild(link)
}

//(1234567.89).toLocaleString('en-US'); // "1,234,567.89"
//(1234567.89).toLocaleString('zh-CN'); // "1,234,567.89"
//(1234567.89).toLocaleString('de-DE'); // "1.234.567,89"
