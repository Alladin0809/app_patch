import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
    plugins: [
        nodePolyfills({
            include: ['buffer'],
            globals: {
                Buffer: true,
            },
        }),
        react(), tailwindcss()],
    define: {
        global: 'globalThis',
    },
    optimizeDeps: {
        include: ['buffer'], // 👈 防止被 external
        esbuildOptions: {
            // 确保开发阶段 esbuild 也能处理
            target: 'esnext',
        },
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        alias: {
            buffer: 'buffer', // 👈 明确指向 npm buffer
            'vaul@1.1.2': 'vaul',
            'sonner@2.0.3': 'sonner',
            'recharts@2.15.2': 'recharts',
            'react-resizable-panels@2.1.7': 'react-resizable-panels',
            'react-hook-form@7.55.0': 'react-hook-form',
            'react-day-picker@8.10.1': 'react-day-picker',
            'next-themes@0.4.6': 'next-themes',
            'lucide-react@0.487.0': 'lucide-react',
            'input-otp@1.4.2': 'input-otp',
            'figma:asset/e0a24d78c5878757e32eb035d59e6e6f0e995bd1.png':
                path.resolve(
                    __dirname,
                    './src/assets/e0a24d78c5878757e32eb035d59e6e6f0e995bd1.png'
                ),
            'figma:asset/d6cdd2a94d477a1f7ebcb829c03a15f2b95902aa.png':
                path.resolve(
                    __dirname,
                    './src/assets/d6cdd2a94d477a1f7ebcb829c03a15f2b95902aa.png'
                ),
            'figma:asset/a611d1e3b332f2082d3d2e215d5b282e29f8b24e.png':
                path.resolve(
                    __dirname,
                    './src/assets/a611d1e3b332f2082d3d2e215d5b282e29f8b24e.png'
                ),
            'figma:asset/6d1e02fe7b13a2ff0e134d15048d2f0d9b1548b2.png':
                path.resolve(
                    __dirname,
                    './src/assets/6d1e02fe7b13a2ff0e134d15048d2f0d9b1548b2.png'
                ),
            'figma:asset/453a93ad0f5853b45352dd99ba02b9eacf65dda2.png':
                path.resolve(
                    __dirname,
                    './src/assets/453a93ad0f5853b45352dd99ba02b9eacf65dda2.png'
                ),
            'figma:asset/39ea00c5bcb8abf265d5907d133dc06449848bab.png':
                path.resolve(
                    __dirname,
                    './src/assets/39ea00c5bcb8abf265d5907d133dc06449848bab.png'
                ),
            'figma:asset/1e332f203cfcc5406ea3b6a2f6a9f128d3dc5eb5.png':
                path.resolve(
                    __dirname,
                    './src/assets/1e332f203cfcc5406ea3b6a2f6a9f128d3dc5eb5.png'
                ),
            'embla-carousel-react@8.6.0': 'embla-carousel-react',
            'cmdk@1.1.1': 'cmdk',
            'class-variance-authority@0.7.1': 'class-variance-authority',
            '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
            '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group@1.1.2':
                '@radix-ui/react-toggle-group',
            '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
            '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
            '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
            '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
            '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
            '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
            '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
            '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
            '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
            '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
            '@radix-ui/react-navigation-menu@1.2.5':
                '@radix-ui/react-navigation-menu',
            '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
            '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
            '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
            '@radix-ui/react-dropdown-menu@2.1.6':
                '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
            '@radix-ui/react-context-menu@2.2.6':
                '@radix-ui/react-context-menu',
            '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
            '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
            '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
            '@radix-ui/react-aspect-ratio@1.1.2':
                '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-alert-dialog@1.1.6':
                '@radix-ui/react-alert-dialog',
            '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        target: 'esnext',
        outDir: 'build',
    },
    server: {
        host: '::',
        port: 3000,
        open: true,
    },
})
