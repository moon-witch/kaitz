import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import svgLoader from 'vite-svg-loader';

export default defineConfig({
  plugins: [
    sveltekit(),
    svgLoader({
      svgoConfig: {
        plugins: [{ name: 'preset-default', params: { overrides: { cleanupIds: false } } }]
      }
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use 'src/lib/styles/variables' as *; @use 'src/lib/styles/mixins' as *;`
      }
    }
  }
});
