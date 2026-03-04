// utils/format.ts
export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`
}

export const formatNumber = (num: number, decimals: number = 2): string => {
    if (!num || Number.isNaN(num)) {
        return '0.00'
    }

    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })
}

export const shortenAddress = (address: string): string => {
    if (!address) return ''
    try {
        return `${address.slice(0, 4)}...${address.slice(-4)}`
    } catch (error) {
        return address
    }
}

export const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 50
    return (value / total) * 100
}

export const solToUsdc = (sol: number, solPrice: number): number => {
    if (solPrice > 0) {
        return (Number(sol) / 1e9) * Number(solPrice)
    } else {
        return (Number(sol) / 1e9) * 136.39
    }
}

export function formatPrice(price: any) {
    // console.log("formatPrice " + price)

    price = Number(price)
    if (Number.isNaN(price)) {
        return '0.00'
    }

    if (price >= 1_000_000_000) {
        return (price / 1_000_000_000).toFixed(2) + 'B'
    } else if (price >= 1000000) {
        return (price / 1000000).toFixed(2) + 'M'
    } else if (price >= 1000) {
        return (price / 1000).toFixed(2) + 'K'
    } else {
        return Number(price).toFixed(2).toString()
    }
}

export function formatDateTime(sec: number) {
    const d = new Date(sec * 1000)

    const Y = d.getFullYear()
    const M = String(d.getMonth() + 1).padStart(2, '0')
    const D = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    const s = String(d.getSeconds()).padStart(2, '0')

    return {
        d: `${Y}-${M}-${D}`,
        t: `${h}:${m}:${s}`,
    }
}

export function formatKM(input: string | number, decimals?: number): string {
    const s = String(input ?? '')
    const hasDollar = s.includes('$')
    const num = parseFloat(s.replace(/[^0-9.-]/g, ''))
    if (!isFinite(num)) return s || '—'
    const abs = Math.abs(num)
    let val = num
    let suffix = ''
    if (abs >= 1e9) {
        val = num / 1e9
        suffix = 'B'
    } else if (abs >= 1e6) {
        val = num / 1e6
        suffix = 'M'
    } else if (abs >= 1e3) {
        val = num / 1e3
        suffix = 'K'
    }
    const d =
        typeof decimals === 'number' ? decimals : Math.abs(val) >= 10 ? 0 : 1
    const rounded = Number(val.toFixed(d))
    const str = `${rounded.toFixed(d)}${suffix}`
    return hasDollar ? `$${str}` : str
}

export function parseNumberFromString(
    input: string | number | undefined
): number {
    if (input === undefined || input === null) return NaN
    if (typeof input === 'number') return input
    const s = String(input)
    const num = parseFloat(s.replace(/[^0-9.-]/g, ''))
    return isFinite(num) ? num : NaN
}
