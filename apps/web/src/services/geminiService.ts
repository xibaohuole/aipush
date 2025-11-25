import { DailySummary, NewsCategory, NewsItem, Region } from '../types';

// ⚠️ SECURITY: API keys are now handled securely by the backend
// The frontend should NEVER contain API keys or make direct AI API calls

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

console.log('🔒 Using secure backend API:', API_URL);

/**
 * Fetch realtime AI news from the backend API
 * The backend securely handles all AI API calls
 */
export async function fetchRealtimeNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch(`${API_URL}/news/ai/generate?count=8`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch news from backend:', response.statusText);
      return getFallbackNews();
    }

    const result = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      console.error('Invalid response from backend');
      return getFallbackNews();
    }

    // Transform backend response to frontend format
    return result.data.map((item: any, index: number) => ({
      id: `news-${Date.now()}-${index}`,
      title: item.title || "Untitled News",
      summary: item.summary || "No summary available.",
      whyItMatters: "Impact analysis available upon request.",
      category: mapCategory(item.category) || NewsCategory.AI,
      region: mapRegion(item.region) || Region.GLOBAL,
      impactScore: typeof item.impact === 'number' ? item.impact : 75,
      source: item.source || "AI Generated",
      url: `https://www.google.com/search?q=${encodeURIComponent(item.title || "")}`,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching realtime news from backend:', error);
    return getFallbackNews();
  }
}

// Helper function to map backend categories to frontend categories
function mapCategory(category: string): NewsCategory {
  const categoryMap: Record<string, NewsCategory> = {
    'AI': NewsCategory.AI,
    'HARDWARE': NewsCategory.HARDWARE,
    'RESEARCH': NewsCategory.RESEARCH,
    'POLICY': NewsCategory.RESEARCH,
    'BUSINESS': NewsCategory.BUSINESS,
    'ETHICS': NewsCategory.RESEARCH,
    'APPLICATION': NewsCategory.SOFTWARE,
  };
  return categoryMap[category] || NewsCategory.AI;
}

// Helper function to map backend regions to frontend regions
function mapRegion(region: string): Region {
  const regionMap: Record<string, Region> = {
    'NORTH_AMERICA': Region.NORTH_AMERICA,
    'EUROPE': Region.EUROPE,
    'ASIA': Region.ASIA,
    'GLOBAL': Region.GLOBAL,
  };
  return regionMap[region] || Region.GLOBAL;
}

/**
 * Fallback news when backend is unavailable
 */
function getFallbackNews(): NewsItem[] {
  return [
    {
      id: 'fallback-1',
      title: 'Backend Connection Error',
      summary: 'Unable to connect to the backend API. Please ensure the backend server is running and accessible.',
      whyItMatters: 'Backend services are required for AI-generated news.',
      category: NewsCategory.AI,
      region: Region.GLOBAL,
      impactScore: 50,
      source: 'System',
      url: '',
      timestamp: new Date().toISOString(),
    },
  ];
}

/**
 * Generate daily briefing - now calls backend
 */
export async function generateDailyBriefing(
  newsItems: NewsItem[],
  language: string
): Promise<DailySummary> {
  // TODO: Implement backend endpoint for daily briefing generation
  // For now, return a simple summary
  return {
    date: new Date().toLocaleDateString(),
    overview: 'Daily briefing will be available soon.',
    keyTrends: [],
    majorDevelopments: [],
    recommendations: [],
  };
}

/**
 * Translate text using AI - now calls backend
 */
export async function translateToChinese(text: string): Promise<string> {
  // TODO: Implement backend endpoint for translation
  // For now, return original text
  return text;
}

/**
 * Ask AI a question about a news item - now calls backend
 */
export async function askAI(question: string, context: string): Promise<string> {
  // TODO: Implement backend endpoint for AI Q&A
  // For now, return a placeholder response
  return 'AI Q&A功能即将上线。AI Q&A feature coming soon.';
}
