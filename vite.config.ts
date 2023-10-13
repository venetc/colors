import { resolve } from 'node:path';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    vue(),
    eslintPlugin(),
  ],
});
