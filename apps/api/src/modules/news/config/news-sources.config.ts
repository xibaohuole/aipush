/**
 * AI 新闻源配置
 * 支持 RSS feeds 和 API 源
 */

export interface NewsSource {
  id: string;
  name: string;
  type: 'rss' | 'api';
  url: string;
  category?: string;
  region?: string;
  enabled: boolean;
  priority?: number; // 1-10, 优先级
}

/**
 * AI 相关新闻源列表
 */
export const NEWS_SOURCES: NewsSource[] = [
  // AI Research & Papers
  {
    id: 'arxiv-ai',
    name: 'arXiv AI Papers',
    type: 'rss',
    url: 'https://export.arxiv.org/rss/cs.AI',
    category: 'research',
    region: 'global',
    enabled: true,
    priority: 9,
  },
  {
    id: 'arxiv-ml',
    name: 'arXiv Machine Learning',
    type: 'rss',
    url: 'https://export.arxiv.org/rss/cs.LG',
    category: 'research',
    region: 'global',
    enabled: true,
    priority: 9,
  },

  // AI News Sites
  {
    id: 'techcrunch-ai',
    name: 'TechCrunch AI',
    type: 'rss',
    url: 'https://techcrunch.com/tag/artificial-intelligence/feed/',
    category: 'product',
    region: 'north_america',
    enabled: true,
    priority: 8,
  },
  {
    id: 'venturebeat-ai',
    name: 'VentureBeat AI',
    type: 'rss',
    url: 'https://venturebeat.com/category/ai/feed/',
    category: 'product',
    region: 'north_america',
    enabled: true,
    priority: 8,
  },
  {
    id: 'mit-tech-ai',
    name: 'MIT Technology Review AI',
    type: 'rss',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
    category: 'research',
    region: 'global',
    enabled: true,
    priority: 9,
  },

  // AI Industry & Business
  {
    id: 'ai-business',
    name: 'AI Business',
    type: 'rss',
    url: 'https://aibusiness.com/feed',
    category: 'finance',
    region: 'global',
    enabled: true,
    priority: 7,
  },

  // AI Ethics & Policy
  {
    id: 'ai-now',
    name: 'AI Now Institute',
    type: 'rss',
    url: 'https://ainowinstitute.org/feed',
    category: 'ethics',
    region: 'global',
    enabled: true,
    priority: 8,
  },

  // Robotics
  {
    id: 'ieee-robotics',
    name: 'IEEE Spectrum Robotics',
    type: 'rss',
    url: 'https://spectrum.ieee.org/feeds/topic/robotics.rss',
    category: 'robotics',
    region: 'global',
    enabled: true,
    priority: 7,
  },

  // Hacker News (AI 相关)
  {
    id: 'hackernews',
    name: 'Hacker News',
    type: 'rss',
    url: 'https://hnrss.org/newest?q=AI+OR+artificial+intelligence+OR+machine+learning',
    category: 'other',
    region: 'global',
    enabled: true,
    priority: 6,
  },
];

/**
 * 获取启用的新闻源
 */
export function getEnabledSources(): NewsSource[] {
  return NEWS_SOURCES.filter((source) => source.enabled).sort(
    (a, b) => (b.priority || 0) - (a.priority || 0)
  );
}

/**
 * 根据分类获取新闻源
 */
export function getSourcesByCategory(category: string): NewsSource[] {
  return NEWS_SOURCES.filter(
    (source) => source.enabled && source.category === category
  );
}

/**
 * 根据区域获取新闻源
 */
export function getSourcesByRegion(region: string): NewsSource[] {
  return NEWS_SOURCES.filter(
    (source) => source.enabled && source.region === region
  );
}
