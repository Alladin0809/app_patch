export function stamp2TimeString(timestamp) {
    let date = new Date(timestamp * 1000) // 转换为毫秒级时间戳

    // 获取小时、分钟、秒，并补0格式化
    let hours = String(date.getHours()).padStart(2, '0')
    let minutes = String(date.getMinutes()).padStart(2, '0')
    let seconds = String(date.getSeconds()).padStart(2, '0')

    // 输出格式：12:00:00
    let timeString = `${hours}:${minutes}:${seconds}`
    return timeString
}

export function formatCountdown(startTimestamp, endTimestamp) {
    // 差值（毫秒）
    let diff = endTimestamp - startTimestamp

    if (diff < 0) diff = 0 // 防止出现负数

    const totalSeconds = Math.floor(diff)
    const day = Math.floor(totalSeconds / (3600 * 24))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    // 补零显示
    const pad = (n) => n.toString().padStart(2, '0')

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export const calculateCountdown = (targetTimestamp) => {
    const nowTime = new Date().getTime()
    //console.log("targetTimestamp " + targetTimestamp)
    //console.log("nowTime " + nowTime)
    const diff = targetTimestamp - nowTime

    if (diff <= 0 || targetTimestamp == null) {
        return { days: '00', hours: '00', minutes: '00', seconds: '00' } // 时间已到或过期
    }

    const days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(
        2,
        '0'
    )
    const hours = String(
        Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    ).padStart(2, '0')
    const minutes = String(
        Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    ).padStart(2, '0')
    const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(
        2,
        '0'
    )

    let time = `${hours}:${minutes}:${seconds}`
    //let result = `${days} Days ${hours}:${minutes}:${seconds}`;
    /*if (days == 1) {
      result = `${days} Day ${hours}:${minutes}:${seconds}`;
    } else if(days == 0) {
      result = `${hours}:${minutes}:${seconds}`;
    }*/

    return { days, hours, minutes, seconds }
}

export function formatTimestamp(timestamp) {
    const date = new Date(timestamp)

    const Y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const H = String(date.getHours()).padStart(2, '0')
    const i = String(date.getMinutes()).padStart(2, '0')

    return `${Y}-${m}-${d} ${H}:${i}`
}

export function formatPassedDays(timestamp) {
    const nowTime = new Date().getTime()
    const diff = nowTime - timestamp
    if (diff <= 0 || timestamp == null) {
        return '0 Dyas' // 时间已到或过期
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = String(
        Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    ).padStart(1, '0')

    let result = `${days} Days`
    if (days == 1) {
        result = `${days} Day`
    } else if (days == 0) {
        result = `${hours} Hours`
    }

    return result
}
