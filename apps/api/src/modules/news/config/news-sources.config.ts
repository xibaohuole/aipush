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

  // 中文 AI 新闻源
  {
    id: 'jiqizhixin',
    name: '机器之心',
    type: 'rss',
    url: 'https://www.jiqizhixin.com/rss',
    category: 'research',
    region: 'asia',
    enabled: true,
    priority: 8,
  },
  {
    id: 'leiphone-ai',
    name: '雷锋网 AI',
    type: 'rss',
    url: 'https://www.leiphone.com/category/ai/feed',
    category: 'product',
    region: 'asia',
    enabled: true,
    priority: 7,
  },

  // 更多英文源
  {
    id: 'openai-blog',
    name: 'OpenAI Blog',
    type: 'rss',
    url: 'https://openai.com/blog/rss.xml',
    category: 'research',
    region: 'north_america',
    enabled: true,
    priority: 10,
  },
  {
    id: 'anthropic-news',
    name: 'Anthropic News',
    type: 'rss',
    url: 'https://www.anthropic.com/news/rss.xml',
    category: 'research',
    region: 'north_america',
    enabled: true,
    priority: 10,
  },
  {
    id: 'deepmind-blog',
    name: 'Google DeepMind Blog',
    type: 'rss',
    url: 'https://deepmind.google/blog/rss.xml',
    category: 'research',
    region: 'europe',
    enabled: true,
    priority: 10,
  },
  {
    id: 'ai-weekly',
    name: 'AI Weekly',
    type: 'rss',
    url: 'https://aiweekly.co/feed/',
    category: 'other',
    region: 'global',
    enabled: true,
    priority: 7,
  },
  {
    id: 'the-verge-ai',
    name: 'The Verge AI',
    type: 'rss',
    url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
    category: 'product',
    region: 'north_america',
    enabled: true,
    priority: 7,
  },
  {
    id: 'wired-ai',
    name: 'WIRED AI',
    type: 'rss',
    url: 'https://www.wired.com/feed/tag/ai/latest/rss',
    category: 'product',
    region: 'north_america',
    enabled: true,
    priority: 7,
  },
  {
    id: 'ars-technica-ai',
    name: 'Ars Technica AI',
    type: 'rss',
    url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
    category: 'product',
    region: 'north_america',
    enabled: true,
    priority: 6,
  },
  {
    id: 'huggingface-blog',
    name: 'Hugging Face Blog',
    type: 'rss',
    url: 'https://huggingface.co/blog/feed.xml',
    category: 'research',
    region: 'global',
    enabled: true,
    priority: 9,
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
