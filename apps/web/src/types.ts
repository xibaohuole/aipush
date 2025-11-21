export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TRENDING = 'TRENDING',
  DAILY_BRIEF = 'DAILY_BRIEF',
  SETTINGS = 'SETTINGS',
}

export enum NewsCategory {
  AI = 'AI',
  HARDWARE = 'Hardware',
  SOFTWARE = 'Software',
  RESEARCH = 'Research',
  BUSINESS = 'Business',
}

export enum Region {
  GLOBAL = 'Global',
  NORTH_AMERICA = 'North America',
  EUROPE = 'Europe',
  ASIA = 'Asia',
}

export type ViewMode = 'CARD' | 'LIST';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  region: Region;
  impact: number;
  timestamp: string;
  source: string;
  url?: string;
  isCustom?: boolean;
}

export interface DailySummary {
  date: string;
  content: string;
  highlights: string[];
  keyTrends: string[];
}
