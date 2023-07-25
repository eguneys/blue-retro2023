import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  base: './',
  plugins: [glsl()],
  build: {
    minify: 'terser',
    terserOptions: {
      mangle: {
        module: true,
        properties: {
          keep_quoted: 'strict',
          reserved: []
        }
      }
    },
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      plugins: [
        visualizer({ filename: 'build-analysis.html', open: true, bundle: true }),
      ],
      output: {
        entryFileNames: 'assets/[name].min.js',
      }
    }
  }
})
