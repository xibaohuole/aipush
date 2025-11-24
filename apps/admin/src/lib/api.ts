import { createApiClient } from '@aipush/api-client';

// 创建 API 客户端实例
export const api = createApiClient(
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
);

// 从 localStorage 恢复 token
const savedToken = localStorage.getItem('auth_token');
if (savedToken) {
  api.setAuthToken(savedToken);
}

export default api;
