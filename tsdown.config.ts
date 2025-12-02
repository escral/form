import { defineConfig } from 'tsdown'

export default defineConfig([
    {
        entry: ['src/index.ts'],
        format: ['esm'],
        dts: true,
        clean: true,
    },
    {
        entry: ['src/zod/index.ts'],
        format: ['esm'],
        dts: true,
        outDir: 'dist/zod',
        external: ['zod', '@escral/form'],
    },
    {
        entry: ['src/vue/index.ts'],
        format: ['esm'],
        dts: true,
        outDir: 'dist/vue',
        external: ['vue', 'zod/mini', '@escral/form'],
    },
])
