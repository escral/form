import { defineConfig } from 'tsdown'

export default defineConfig([
    {
        entry: ['src/index.ts'],
        format: ['esm'],
        dts: true,
        clean: true,
    },
    {
        entry: ['src/vue/index.ts'],
        format: ['esm'],
        dts: true,
        outDir: 'dist/vue',
    },
])
