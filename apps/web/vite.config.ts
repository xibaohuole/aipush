import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env files from the apps/web directory (not monorepo root)
  const env = loadEnv(mode, __dirname, '');

  return {
    base: mode === 'production' ? '/aipush/' : '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // ⚠️ SECURITY: Never expose API keys in frontend code
      // Only expose non-sensitive configuration like the backend API URL
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:4000/api/v1')
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
