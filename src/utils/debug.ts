
export const ErudaDebugger = () => {

    // Restore original console.log if it was overridden
    if (typeof (window as any).__ORIGINAL_CONSOLE_LOG__ === 'function') {
        console.log = (window as any).__ORIGINAL_CONSOLE_LOG__;
    }

    import('eruda').then((eruda) => {
        eruda.default.init({
            tool: ['console', 'elements', 'network', 'resources'],  // 指定默认面板
            defaults: {
                displaySize: 60,     // 面板大小
                transparency: 0.9,   // 透明度
                theme: 'Dark'
            }
        })
    })
};