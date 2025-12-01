import { NewsItem, NewsCategory, Region } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export interface PaginatedNewsResponse {
  items: NewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 从后端 API 获取新闻列表
 */
export async function fetchNewsFromAPI(params?: {
  page?: number;
  limit?: number;
  category?: string;
  region?: string;
  search?: string;
}): Promise<PaginatedNewsResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category && params.category !== 'All') queryParams.append('category', params.category);
    if (params?.region && params.region !== 'All') queryParams.append('region', params.region);
    if (params?.search) queryParams.append('search', params.search);

    const url = `${API_BASE_URL}/news?${queryParams.toString()}`;
    console.log('🌐 Fetching news from API:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.data?.items) {
      throw new Error('Invalid API response format');
    }

    console.log(`✅ Fetched ${data.data.items.length} news items from API (Page ${data.data.pagination.page}/${data.data.pagination.totalPages})`);

    // 映射后端枚举值到前端枚举值
    const categoryMap: Record<string, NewsCategory> = {
      'ai': NewsCategory.AI,
      'hardware': NewsCategory.HARDWARE,
      'software': NewsCategory.SOFTWARE,
      'research': NewsCategory.RESEARCH,
      'business': NewsCategory.BUSINESS,
      'product': NewsCategory.SOFTWARE,
      'finance': NewsCategory.BUSINESS,
      'policy': NewsCategory.RESEARCH,
      'ethics': NewsCategory.RESEARCH,
      'robotics': NewsCategory.HARDWARE,
      'lifestyle': NewsCategory.SOFTWARE,
      'entertainment': NewsCategory.SOFTWARE,
      'application': NewsCategory.SOFTWARE,
      'meme': NewsCategory.SOFTWARE,
      'other': NewsCategory.AI,
    };

    const regionMap: Record<string, Region> = {
      'global': Region.GLOBAL,
      'north_america': Region.NORTH_AMERICA,
      'europe': Region.EUROPE,
      'asia': Region.ASIA,
      'other': Region.GLOBAL,
    };

    // 转换后端数据格式到前端格式
    const items = data.data.items.map((item: any) => ({
      id: item.id,
      title: item.title,
      titleCn: item.titleCn,
      summary: item.summary,
      summaryCn: item.summaryCn,
      category: categoryMap[item.category?.toLowerCase()] || NewsCategory.AI,
      region: regionMap[item.region?.toLowerCase()] || Region.GLOBAL,
      impact: item.impactScore,
      timestamp: item.publishedAt,
      source: item.source || 'Unknown',
      url: item.sourceUrl || '',
      isTrending: item.isTrending,
      tags: item.tags || [],
      whyItMatters: item.whyItMatters,
      whyItMattersCn: item.whyItMattersCn,
    }));

    return {
      items,
      pagination: data.data.pagination,
    };
  } catch (error: any) {
    console.error('❌ Error fetching news from API:', error);
    throw error;
  }
}

/**
 * 获取趋势新闻
 */
export async function fetchTrendingNews(limit: number = 10): Promise<NewsItem[]> {
  try {
    const url = `${API_BASE_URL}/news/trending/list?limit=${limit}`;
    console.log('🔥 Fetching trending news from API:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    console.log(`✅ Fetched ${data.data.length} trending items`);

    return data.data.map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      category: item.category as NewsCategory,
      region: item.region as Region,
      impact: item.impactScore,
      timestamp: item.publishedAt,
      source: item.source || 'Unknown',
      url: '',
      tags: item.tags || [],
    }));
  } catch (error: any) {
    console.error('❌ Error fetching trending news:', error);
    throw error;
  }
}

/**
 * 增加新闻书签
 */
export async function addBookmark(newsId: string): Promise<void> {
  try {
    const url = `${API_BASE_URL}/news/${newsId}/bookmark`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to add bookmark: ${response.status}`);
    }

    console.log(`✅ Bookmark added for news ${newsId}`);
  } catch (error: any) {
    console.error('❌ Error adding bookmark:', error);
    // 不抛出错误，书签功能是非关键功能
  }
}

/**
 * 移除新闻书签
 */
export async function removeBookmark(newsId: string): Promise<void> {
  try {
    const url = `${API_BASE_URL}/news/${newsId}/unbookmark`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to remove bookmark: ${response.status}`);
    }

    console.log(`✅ Bookmark removed for news ${newsId}`);
  } catch (error: any) {
    console.error('❌ Error removing bookmark:', error);
    // 不抛出错误，书签功能是非关键功能
  }
}

/**
 * 获取分类统计
 */
export async function getCategoryStats(): Promise<Array<{ category: string; count: number }>> {
  try {
    const url = `${API_BASE_URL}/news/stats/categories`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid API response format');
    }

    return data.data;
  } catch (error: any) {
    console.error('❌ Error fetching category stats:', error);
    return [];
  }
}
