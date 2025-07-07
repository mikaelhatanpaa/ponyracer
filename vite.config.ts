import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      // https://rollupjs.org/guide/en/#outputmanualchunks
      output: {
        manualChunks: {
          races: [
            './src/views/Races.vue',
            './src/views/PendingRaces.vue',
            './src/views/FinishedRaces.vue',
            './src/views/Bet.vue',
            './src/views/Live.vue'
          ],
          users: ['./src/views/Register.vue', './src/views/Login.vue']
        }
      }
    }
  }
});
