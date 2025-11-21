
import { NewsItem, NewsCategory, DailySummary, Region } from "../types";
import { MOCK_SOURCES, RAW_NEWS_FEED, MOCK_COMMENTS } from "../constants";
import { callGLMOptimized, batchProcess, PromptOptimizer, TokenTracker } from "./tokenOptimizer";

// Legacy function for backward compatibility
async function callGLM(prompt: string, useJson: boolean = false): Promise<string> {
  return callGLMOptimized(prompt, { useJson });
}

/**
 * Fetches real-time news using Google Search Grounding.
 * Falls back to the static RAW_NEWS_FEED if search fails.
 */
export const fetchRealtimeNews = async (): Promise<NewsItem[]> => {
  const API_KEY = process.env.GLM_API_KEY || process.env.VITE_GLM_API_KEY || '';
  
  if (!API_KEY) {
    console.error("GLM API Key is missing");
    return processRawNews(RAW_NEWS_FEED);
  }

  try {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // 使用优化的prompt
    const prompt = `Generate 8-12 AI news headlines for ${today}.
Focus: funding, research, product launches, policy, 1 viral topic.
Return JSON: [{"headline":"","source":"","url":"","summary":""}]`;

    const text = await callGLMOptimized(prompt, { 
      useJson: true, 
      maxTokens: 500,
      priorityModel: 'glm-4-flash' // 使用最便宜的模型
    });
    
    const data = JSON.parse(text);
    const headlines = data.headlines || data || [];

    if (Array.isArray(headlines) && headlines.length > 0) {
      const realHeadlines = headlines.map((item: any) => item.headline || item.title || item).filter(Boolean);
      return processRawNews(realHeadlines.slice(0, 12));
    }
  } catch (error) {
    console.error("Error fetching realtime news (GLM):", error);
  }

  return processRawNews(RAW_NEWS_FEED);
};

export const processRawNews = async (rawHeadlines: string[]): Promise<NewsItem[]> => {
  if (rawHeadlines.length === 0) return [];

  try {
    // 使用批量处理优化器
    const chunkResults = await batchProcess(rawHeadlines, async (batch) => {
      // 使用优化的prompt
      const prompt = PromptOptimizer.optimizeNewsAnalysis(batch);
      
      try {
        const text = await callGLMOptimized(prompt, { 
          useJson: true, 
          maxTokens: 800,
          priorityModel: 'glm-4-flash' // 批量处理用便宜模型
        });
        
        if (!text) return [];
        const data = JSON.parse(text);
        return Array.isArray(data.news) ? data.news : [];
      } catch (err) {
        console.warn(`Batch processing failed:`, err);
        return [];
      }
    }, 4); // 批量大小为4

    const allItems = chunkResults.flat();

    return allItems.map((item: any, index: number) => ({
      id: `news-${Date.now()}-${index}`,
      title: item.title || "Untitled News",
      summary: item.summary || "No summary available.",
      whyItMatters: item.whyItMatters || "Impact analysis unavailable.",
      category: item.category || NewsCategory.OTHER,
      region: item.region || Region.GLOBAL,
      impactScore: typeof item.impactScore === 'number' ? item.impactScore : 5,
      source: item.source || "Unknown Source",
      url: `https://www.google.com/search?q=${encodeURIComponent(item.title || "")}`,
      timestamp: new Date().toISOString(),
      citations: [],
      comments: MOCK_COMMENTS.sort(() => 0.5 - Math.random()).slice(0, 2)
    }));

  } catch (error) {
    console.error("Error processing news with GLM:", error);
    return [];
  }
};

export const generateDailyBriefing = async (newsItems: NewsItem[], language: string = 'English'): Promise<DailySummary | null> => {
  if (newsItems.length === 0) return null;

  try {
    // 使用优化的prompt
    const prompt = PromptOptimizer.optimizeSummary(newsItems);
    
    const text = await callGLMOptimized(prompt, { 
      useJson: true, 
      maxTokens: 1000,
      priorityModel: 'glm-4.5-air' // 摘要用中等成本模型
    });
    
    const summary = JSON.parse(text || "{}");
    return {
      ...summary,
      date: new Date().toLocaleDateString()
    };

  } catch (error) {
    return null;
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text || targetLanguage === 'English') return text;
  try {
    // 使用优化的翻译prompt
    const prompt = PromptOptimizer.optimizeTranslation(text, targetLanguage);
    return await callGLMOptimized(prompt, { 
      maxTokens: 200,
      priorityModel: 'glm-4-flash' // 翻译用最便宜的模型
    });
  } catch (error) {
    return text;
  }
};

// New: Ask AI about a specific news item
export const askAI = async (question: string, context: NewsItem): Promise<string> => {
  try {
    const contextText = `Title: ${context.title}. Summary: ${context.summary}. Why it matters: ${context.whyItMatters}`;
    
    // 使用优化的问答prompt
    const prompt = PromptOptimizer.optimizeQA(question, contextText);
    
    return await callGLMOptimized(prompt, { 
      maxTokens: 300,
      priorityModel: 'glm-4-flash' // 问答用最便宜的模型
    });
  } catch (e) {
    return "Error reaching AI.";
  }
}

// 导出token统计功能
export { TokenTracker };
