import { NewsItem, DailySummary, NewsCategory, Region } from '../types';

// Initialize GLM AI (智谱AI)
// 直接使用API密钥，确保在所有环境下都能工作
const API_KEY = '1c1aa0b4b71f43518dd7d03ba933bd3c.nD3WVYmgqa8thszj';

// 同时检查环境变量（用于生产环境）
const ENV_API_KEY = import.meta.env.VITE_GLM_API_KEY;
// 如果环境变量是占位符或无效，使用硬编码的 API key
const isValidKey = ENV_API_KEY &&
                   ENV_API_KEY !== 'your-glm-api-key-here' &&
                   ENV_API_KEY.includes('.');
const FINAL_API_KEY = isValidKey ? ENV_API_KEY : API_KEY;

console.log('🔑 GLM API Key Status:');
console.log('  Environment variable exists:', !!ENV_API_KEY);
console.log('  Using key length:', FINAL_API_KEY.length);
console.log('  Key format valid:', FINAL_API_KEY.includes('.'));

const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// Model priority: low cost to high cost
const MODEL_PRIORITY = ['glm-4-flash', 'glm-4.5-air', 'glm-4.5', 'glm-4.6'];

/**
 * Call GLM API with automatic model fallback
 */
async function callGLM(prompt: string): Promise<string> {
  if (!FINAL_API_KEY) {
    throw new Error('GLM API key not found');
  }

  // Debug API key info
  console.log('🔑 API Key Debug:');
  console.log('  Length:', FINAL_API_KEY.length);
  console.log('  Format:', FINAL_API_KEY.includes('.') ? 'Contains dot (correct)' : 'Missing dot');
  console.log('  First 10 chars:', FINAL_API_KEY.substring(0, 10) + '...');

  for (const model of MODEL_PRIORITY) {
    try {
      console.log(`🤖 Trying model: ${model}`);
      
      const requestBody = {
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        top_p: 0.9,
      };

      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(GLM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FINAL_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const error = await response.text();
        console.warn(`❌ Model ${model} failed: ${response.status} - ${error}`);
        console.warn('❌ Full error response:', error);
        continue; // Try next model
      }

      const data = await response.json();
      console.log(`✅ Success with model: ${model}`);
      console.log('📊 Token usage:', JSON.stringify(data.usage || {}));
      return data.choices[0].message.content;
      
    } catch (error) {
      console.warn(`❌ Model ${model} error:`, error);
      continue; // Try next model
    }
  }

  throw new Error('All GLM models failed');
}

/**
 * Fetch realtime AI news using GLM API
 * Generates current AI news based on today's date and trends
 */
export async function fetchRealtimeNews(): Promise<NewsItem[]> {
  try {
    // Check if API key is available
    if (!FINAL_API_KEY) {
      console.error('GLM API key not found');
      return getFallbackNews();
    }

    const today = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const prompt = `生成今天（${today}）的 6-8 条真实且最新的 AI 新闻。

    每条新闻需要包含：
    - title: 吸引人的真实标题
    - summary: 1-2句话的摘要（最多150字符）
    - category: 从以下选择一个 [AI, HARDWARE, RESEARCH, POLICY, BUSINESS, ETHICS, APPLICATION]
    - region: 从以下选择一个 [NORTH_AMERICA, EUROPE, ASIA, GLOBAL]
    - impact: 60-100之间的数字，代表影响力/重要性
    - source: 真实的新闻来源名称

    关注多样化的主题：模型发布、硬件发布、研究突破、政策变化、商业发展等。

    只返回有效的 JSON 数组，不要有任何额外的文本或 markdown 格式。示例格式：
    [{"title":"...","summary":"...","category":"AI","region":"NORTH_AMERICA","impact":95,"source":"..."}]`;

    const text = await callGLM(prompt);

    // Clean the response (remove markdown code blocks if present)
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const newsData = JSON.parse(cleanedText);

    // Transform to NewsItem format
    const newsItems: NewsItem[] = newsData.map((item: any, index: number) => ({
      id: `glm-${Date.now()}-${index}`,
      title: item.title,
      summary: item.summary,
      category: NewsCategory[item.category as keyof typeof NewsCategory] || NewsCategory.AI,
      region: Region[item.region as keyof typeof Region] || Region.GLOBAL,
      impact: item.impact || 75,
      timestamp: new Date(Date.now() - index * 1800000).toISOString(), // Stagger timestamps
      source: item.source || 'AI News',
      url: `#news-${Date.now()}-${index}`,
    }));

    return newsItems;
  } catch (error: any) {
    console.error('Error fetching news from GLM:', error);

    // Check if it's a rate limit error
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      console.warn('Rate limit reached. Using cached data or fallback. Try again in a few minutes.');
    }

    // Return fallback mock data if API fails
    return getFallbackNews();
  }
}

/**
 * Generate daily briefing using GLM API
 */
export async function generateDailyBriefing(
  newsItems: NewsItem[],
  language: string
): Promise<DailySummary> {
  try {
    const newsTitles = newsItems.slice(0, 10).map((n, i) => `${i + 1}. ${n.title}`).join('\n');

    const isChinese = language === 'Chinese' || language === '中文';
    const prompt = isChinese
      ? `你是一位 AI 新闻分析师。基于今天的这些 AI 新闻标题，生成一份全面的每日简报：

${newsTitles}

生成中文每日简报，包括：
1. content: 连贯的3-4段摘要，分析当天的关键发展及其意义
2. highlights: 5-7个关键要点的数组，突出最重要的收获
3. keyTrends: 4-6个从新闻中识别出的热门话题/主题的数组

只返回有效的 JSON，格式如下（无 markdown，无代码块）：
{"content":"...","highlights":["...","..."],"keyTrends":["...","..."]}`
      : `You are an AI news analyst. Based on these top AI news headlines from today, generate a comprehensive daily brief:

${newsTitles}

Generate a daily brief in English with:
1. content: A coherent 3-4 paragraph summary analyzing the day's key developments and their significance
2. highlights: An array of 5-7 key bullet points highlighting the most important takeaways
3. keyTrends: An array of 4-6 trending topics/themes identified from the news

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{"content":"...","highlights":["...","..."],"keyTrends":["...","..."]}`;

    const text = await callGLM(prompt);

    // Clean the response
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const briefData = JSON.parse(cleanedText);

    return {
      date: new Date().toLocaleDateString(language === 'Chinese' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      content: briefData.content,
      highlights: briefData.highlights || [],
      keyTrends: briefData.keyTrends || [],
    };
  } catch (error) {
    console.error('Error generating daily briefing:', error);
    // Return fallback summary
    return getFallbackBriefing(language);
  }
}

/**
 * Ask AI a question about a specific news item using GLM API
 */
export async function askAI(question: string, newsItem: NewsItem): Promise<string> {
  try {
    const prompt = `You are an AI news expert assistant. A user is reading this news article:

Title: "${newsItem.title}"
Summary: "${newsItem.summary}"
Category: ${newsItem.category}
Impact: ${newsItem.impact}/100

The user asks: "${question}"

Provide a helpful, informative, and concise response (2-3 paragraphs max). Focus on:
- Answering their specific question
- Providing context and implications
- Explaining technical terms if needed
- Being objective and factual

Do NOT use JSON format. Write a natural, conversational response.`;

    const answer = await callGLM(prompt);
    return answer;
  } catch (error) {
    console.error('Error asking AI:', error);
    return `I apologize, but I'm having trouble processing your question right now. Please try again in a moment.

For the article "${newsItem.title}", I'd recommend checking the original source for more detailed information.`;
  }
}

/**
 * Fallback mock news when API fails
 */
function getFallbackNews(): NewsItem[] {
  return [
    {
      id: 'fallback-1',
      title: 'AI News Loading - Cached Data Available',
      summary: 'Rate limit reached. Cached data will be used when available. New data will load automatically in a few minutes.',
      category: NewsCategory.AI,
      region: Region.GLOBAL,
      impact: 75,
      timestamp: new Date().toISOString(),
      source: 'AI Pulse Daily',
      url: '#',
    },
    {
      id: 'fallback-2',
      title: 'Add Your Own News Items',
      summary: 'While waiting, you can add custom news items using the "Add Custom News" button in the sidebar.',
      category: NewsCategory.AI,
      region: Region.GLOBAL,
      impact: 70,
      timestamp: new Date().toISOString(),
      source: 'AI Pulse Daily',
      url: '#',
    },
  ];
}

/**
 * Fallback briefing when API fails
 */
function getFallbackBriefing(language: string): DailySummary {
  return {
    date: new Date().toLocaleDateString(),
    content:
      language === 'Chinese'
        ? '由于技术问题，每日摘要暂时无法生成。请稍后重试。'
        : 'Daily briefing is temporarily unavailable due to technical issues. Please try again later.',
    highlights: [language === 'Chinese' ? '正在更新中...' : 'Updating...'],
    keyTrends: [language === 'Chinese' ? '人工智能' : 'Artificial Intelligence'],
  };
}
