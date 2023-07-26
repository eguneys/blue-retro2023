import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite'
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  base: './',
  plugins: [glsl(), viteImagemin({
    optipng: { optimizationLevel: 7 }
  })],
  build: {
    minify: 'terser',
    terserOptions: {
      mangle: {
        module: true,
        properties: {
          debug: true,
          keep_quoted: 'strict',
          reserved: ['make', 'current_frame', '_current_frame']
        }
      }
    },
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].min.js',
      }
    }
  }
})
