
export enum NewsCategory {
  RESEARCH = 'Research',
  PRODUCT = 'Product',
  FINANCE = 'Finance',
  POLICY = 'Policy',
  ETHICS = 'Ethics',
  ROBOTICS = 'Robotics',
  LIFESTYLE = 'Lifestyle',
  ENTERTAINMENT = 'Entertainment',
  MEME = 'Meme', // New category
  OTHER = 'Other'
}

export enum Region {
  GLOBAL = 'Global',
  NORTH_AMERICA = 'North America',
  EUROPE = 'Europe',
  ASIA = 'Asia',
  OTHER = 'Other'
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  likes: number;
  isPinned?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  whyItMatters: string; // New: "一句话影响"
  source: string;
  url: string;
  category: NewsCategory;
  region: Region;
  timestamp: string;
  impactScore: number; // 1-10
  isCustom?: boolean;
  citations?: string[];
  comments?: Comment[]; // User comments
}

export interface DailySummary {
  date: string;
  headline: string;
  keyTakeaways: string[];
  bodyContent: string;
  trendingTopics: string[];
}

export interface UserSettings {
  emailNotification: boolean;
  pushNotification: boolean;
  frequency: 'daily' | 'realtime' | 'weekly';
  categories: NewsCategory[];
  language: string;
  font: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TRENDING = 'TRENDING',
  DAILY_BRIEF = 'DAILY_BRIEF',
  SETTINGS = 'SETTINGS'
}

export type ViewMode = 'CARD' | 'LIST';
