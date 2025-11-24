import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  ApiError,
  NewsItem,
  NewsFilters,
  PaginationParams,
  User,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  Bookmark,
  Comment,
  DailySummary,
  Notification,
  Settings,
  UpdateSettingsData,
} from '@aipush/types';
import { AppError } from '@aipush/utils';

// ==================== API Client Configuration ====================

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError<ApiError>) => {
        return this.handleError(error);
      }
    );
  }

  private handleError(error: AxiosError<ApiError>): never {
    if (error.response) {
      const apiError = error.response.data;
      throw new AppError(
        apiError?.message || 'API request failed',
        apiError?.code || 'API_ERROR',
        error.response.status,
        apiError?.details
      );
    } else if (error.request) {
      throw new AppError(
        'No response from server',
        'NETWORK_ERROR',
        0
      );
    } else {
      throw new AppError(
        error.message || 'Request failed',
        'REQUEST_ERROR',
        0
      );
    }
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  // ==================== Authentication APIs ====================

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.client.post('/auth/login', credentials);
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.client.post('/auth/register', data);
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.client.post('/auth/logout');
    this.authToken = null;
    return response;
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    return this.client.post('/auth/refresh', { refreshToken });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.client.get('/auth/me');
  }

  // ==================== News APIs ====================

  async getNews(params?: PaginationParams & NewsFilters): Promise<ApiResponse<NewsItem[]>> {
    return this.client.get('/news', { params });
  }

  async getNewsById(id: string): Promise<ApiResponse<NewsItem>> {
    return this.client.get(`/news/${id}`);
  }

  async createNews(data: Partial<NewsItem>): Promise<ApiResponse<NewsItem>> {
    return this.client.post('/news', data);
  }

  async updateNews(id: string, data: Partial<NewsItem>): Promise<ApiResponse<NewsItem>> {
    return this.client.patch(`/news/${id}`, data);
  }

  async deleteNews(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(`/news/${id}`);
  }

  async getTrendingNews(params?: PaginationParams): Promise<ApiResponse<NewsItem[]>> {
    return this.client.get('/news/trending', { params });
  }

  async searchNews(query: string, params?: PaginationParams): Promise<ApiResponse<NewsItem[]>> {
    return this.client.get('/news/search', { params: { q: query, ...params } });
  }

  // ==================== Bookmark APIs ====================

  async getBookmarks(params?: PaginationParams): Promise<ApiResponse<Bookmark[]>> {
    return this.client.get('/bookmarks', { params });
  }

  async createBookmark(newsId: string, notes?: string): Promise<ApiResponse<Bookmark>> {
    return this.client.post('/bookmarks', { newsId, notes });
  }

  async deleteBookmark(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(`/bookmarks/${id}`);
  }

  async isBookmarked(newsId: string): Promise<ApiResponse<boolean>> {
    return this.client.get(`/bookmarks/check/${newsId}`);
  }

  // ==================== Comment APIs ====================

  async getComments(newsId: string, params?: PaginationParams): Promise<ApiResponse<Comment[]>> {
    return this.client.get(`/news/${newsId}/comments`, { params });
  }

  async createComment(newsId: string, content: string, parentId?: string): Promise<ApiResponse<Comment>> {
    return this.client.post(`/news/${newsId}/comments`, { content, parentId });
  }

  async updateComment(commentId: string, content: string): Promise<ApiResponse<Comment>> {
    return this.client.patch(`/comments/${commentId}`, { content });
  }

  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    return this.client.delete(`/comments/${commentId}`);
  }

  async likeComment(commentId: string): Promise<ApiResponse<Comment>> {
    return this.client.post(`/comments/${commentId}/like`);
  }

  async unlikeComment(commentId: string): Promise<ApiResponse<Comment>> {
    return this.client.delete(`/comments/${commentId}/like`);
  }

  // ==================== Daily Summary APIs ====================

  async getDailySummaries(params?: PaginationParams): Promise<ApiResponse<DailySummary[]>> {
    return this.client.get('/daily-summaries', { params });
  }

  async getDailySummaryByDate(date: string): Promise<ApiResponse<DailySummary>> {
    return this.client.get(`/daily-summaries/${date}`);
  }

  async getLatestDailySummary(): Promise<ApiResponse<DailySummary>> {
    return this.client.get('/daily-summaries/latest');
  }

  // ==================== User Profile APIs ====================

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.client.patch('/users/profile', data);
  }

  async updatePreferences(preferences: Partial<User['preferences']>): Promise<ApiResponse<User>> {
    return this.client.patch('/users/preferences', preferences);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.client.post('/users/change-password', { currentPassword, newPassword });
  }

  // ==================== Notification APIs ====================

  async getNotifications(params?: PaginationParams): Promise<ApiResponse<Notification[]>> {
    return this.client.get('/notifications', { params });
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<Notification>> {
    return this.client.patch(`/notifications/${id}/read`);
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return this.client.post('/notifications/read-all');
  }

  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(`/notifications/${id}`);
  }

  // ==================== Analytics APIs ====================

  async trackEvent(event: string, properties: Record<string, unknown>): Promise<void> {
    try {
      await this.client.post('/analytics/track', { event, properties });
    } catch (error) {
      // Silent fail for analytics
      console.error('Failed to track event:', error);
    }
  }

  async trackPageView(path: string, title: string): Promise<void> {
    return this.trackEvent('page_view', { path, title });
  }

  async trackNewsView(newsId: string): Promise<void> {
    return this.trackEvent('news_view', { newsId });
  }

  // ==================== Settings APIs ====================

  async getSettings(): Promise<ApiResponse<Settings>> {
    return this.client.get('/settings');
  }

  async updateSettings(data: UpdateSettingsData): Promise<ApiResponse<Settings>> {
    return this.client.put('/settings', data);
  }

  async resetSettings(): Promise<ApiResponse<Settings>> {
    return this.client.post('/settings/reset');
  }
}

// ==================== Create Default API Client ====================

export function createApiClient(baseURL?: string): ApiClient {
  return new ApiClient({
    baseURL: baseURL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
    timeout: 30000,
  });
}

// Export singleton instance
export const apiClient = createApiClient();

// ==================== GLM Service (Legacy - to be migrated to backend) ====================

import type { NewsCategory, Region } from '@aipush/types';

export class GLMService {
  private apiKey: string;
  private apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callGLM(prompt: string): Promise<string> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`GLM API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async fetchRealtimeNews(): Promise<NewsItem[]> {
    // This will be moved to backend, keeping here for compatibility
    try {
      const prompt = `Find the top 8-12 most impactful AI news from the last 24 hours. Focus on:
- Funding rounds & acquisitions
- Research breakthroughs
- Major product launches
- Policy changes

Return in JSON format:
{
  "headlines": [
    {
      "title": "...",
      "source": "...",
      "url": "...",
      "summary": "..."
    }
  ]
}`;

      const result = await this.callGLM(prompt);
      // Process result and return news items
      // (Implementation details omitted for brevity)
      return [];
    } catch (error) {
      console.error('Failed to fetch news from GLM:', error);
      return [];
    }
  }

  async translateText(text: string, targetLang: string): Promise<string> {
    const prompt = `Translate to ${targetLang}: ${text}`;
    return await this.callGLM(prompt);
  }

  async askAI(question: string, context: string): Promise<string> {
    const prompt = `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`;
    return await this.callGLM(prompt);
  }
}

export function createGLMService(apiKey: string): GLMService {
  return new GLMService(apiKey);
}
