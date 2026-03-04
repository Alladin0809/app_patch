import imageCompression from 'browser-image-compression'
// 压缩图片
export async function compressImage(file) {
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
    }
    try {
        if (
            file.type === 'image/png' ||
            file.type === 'image/jpg' ||
            file.type === 'image/jpeg' ||
            file.type === 'image/webp'
        ) {
            return await imageCompression(file, options)
        } else {
            return file // 对于其他格式，直接返回原始文件
        }
    } catch (error) {
        return file // 在压缩失败时返回原始文件
    }
}
