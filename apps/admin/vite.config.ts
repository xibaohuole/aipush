import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: mode === 'production' ? '/admin/' : '/',
    server: {
      port: 3001,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
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
