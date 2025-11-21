import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: mode === 'production' ? '/aipush/' : '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:4000')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@aipush/types': path.resolve(__dirname, '../../packages/types/src'),
        '@aipush/utils': path.resolve(__dirname, '../../packages/utils/src'),
        '@aipush/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
      }
    }
  };
});
