/**
 * Eruda dev tools: load and init only in qa mode (side-effect on import).
 */
const meta = import.meta as any
if (meta.env?.MODE === 'qa') {
    import('eruda').then((eruda) => {
        eruda.default.init({
            tool: ['console', 'elements', 'network', 'resources'],
            defaults: {
                displaySize: 60,
                transparency: 0.9,
                theme: 'Dark',
            },
        })
    })
}

if ((import.meta as any).env.MODE === 'production') {
    console.log = () => {}
}
