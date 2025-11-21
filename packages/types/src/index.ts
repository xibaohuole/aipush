// ==================== Enums ====================

export enum NewsCategory {
  RESEARCH = 'Research',
  PRODUCT = 'Product',
  FINANCE = 'Finance',
  POLICY = 'Policy',
  ETHICS = 'Ethics',
  ROBOTICS = 'Robotics',
  LIFESTYLE = 'Lifestyle',
  ENTERTAINMENT = 'Entertainment',
  MEME = 'Meme',
  OTHER = 'Other'
}

export enum Region {
  GLOBAL = 'Global',
  NORTH_AMERICA = 'North America',
  EUROPE = 'Europe',
  ASIA = 'Asia',
  OTHER = 'Other'
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TRENDING = 'TRENDING',
  DAILY_BRIEF = 'DAILY_BRIEF',
  SETTINGS = 'SETTINGS'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  EDITOR = 'editor'
}

export enum NotificationType {
  EMAIL = 'email',
  PUSH = 'push',
  IN_APP = 'in_app'
}

// ==================== Base Types ====================

export type ViewMode = 'CARD' | 'LIST';

export type NotificationFrequency = 'daily' | 'realtime' | 'weekly';

export type SortOrder = 'asc' | 'desc';

// ==================== News Related ====================

export interface Comment {
  id: string;
  userId: string;
  user: string;
  avatar: string;
  content: string;
  likes: number;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
  parentId?: string; // For threaded comments
  replies?: Comment[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  whyItMatters: string;
  source: string;
  url: string;
  category: NewsCategory;
  region: Region;
  timestamp: string;
  impactScore: number; // 1-10
  isCustom?: boolean;
  citations?: string[];
  comments?: Comment[];
  viewCount?: number;
  bookmarkCount?: number;
  shareCount?: number;
  tags?: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailySummary {
  id: string;
  date: string;
  headline: string;
  keyTakeaways: string[];
  bodyContent: string;
  trendingTopics: string[];
  newsItems: string[]; // News item IDs
  audioUrl?: string; // For podcast feature
  createdAt: string;
}

// ==================== User Related ====================

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  role: UserRole;
  preferences: UserPreferences;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserPreferences {
  emailNotification: boolean;
  pushNotification: boolean;
  frequency: NotificationFrequency;
  categories: NewsCategory[];
  regions: Region[];
  language: string;
  theme: 'light' | 'dark' | 'auto';
  viewMode: ViewMode;
  compactMode: boolean;
}

export interface UserSettings extends UserPreferences {
  font: string;
  fontSize: 'small' | 'medium' | 'large';
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
}

// ==================== Authentication ====================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface AuthUser extends User {
  tokens: AuthTokens;
}

// ==================== API Related ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiMeta {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface NewsFilters {
  category?: NewsCategory | NewsCategory[];
  region?: Region | Region[];
  startDate?: string;
  endDate?: string;
  search?: string;
  minImpactScore?: number;
  tags?: string[];
}

// ==================== Bookmark & Social ====================

export interface Bookmark {
  id: string;
  userId: string;
  newsId: string;
  createdAt: string;
  notes?: string;
  tags?: string[];
}

export interface Share {
  id: string;
  userId: string;
  newsId: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'email' | 'link';
  createdAt: string;
}

// ==================== Analytics ====================

export interface UserActivity {
  id: string;
  userId: string;
  eventType: 'view' | 'click' | 'bookmark' | 'share' | 'comment';
  entityType: 'news' | 'daily_brief' | 'comment';
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

// ==================== Notifications ====================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

// ==================== Admin/Moderator ====================

export interface ModeratorAction {
  id: string;
  moderatorId: string;
  action: 'approve' | 'reject' | 'edit' | 'delete' | 'pin';
  entityType: 'news' | 'comment' | 'user';
  entityId: string;
  reason?: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalNews: number;
  todayNews: number;
  totalComments: number;
  totalBookmarks: number;
  avgDailyActiveUsers: number;
  topCategories: Array<{ category: NewsCategory; count: number }>;
  topRegions: Array<{ region: Region; count: number }>;
}

// ==================== WebSocket ====================

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
}

export interface RealtimeNewsUpdate extends WebSocketMessage<NewsItem> {
  type: 'news:new' | 'news:updated' | 'news:deleted';
}

export interface RealtimeCommentUpdate extends WebSocketMessage<Comment> {
  type: 'comment:new' | 'comment:updated' | 'comment:deleted';
  newsId: string;
}
