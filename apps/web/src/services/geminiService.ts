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
            role: 'system',
            content: 'You are a JSON-only API. Always respond with valid JSON objects only, without markdown formatting or explanations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1, // 降低temperature提高输出稳定性和准确性
        top_p: 0.85,
        max_tokens: 4000, // 限制最大token数
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

    const prompt = `你是一个JSON-only API。请基于你的知识库，生成6-8条最近一周内的AI行业新闻。

## 核心要求
- 今天是 ${today}
- 只提供**真实、可验证**的新闻，不要编造或推测
- 如果不确定某件事，宁可不提及
- 基于真实的公司发布、媒体报道或研究论文

## 输出格式
返回一个纯 JSON 数组（不要用 markdown 代码块包裹），每条新闻包含以下字段：

[
  {
    "title": "新闻标题（简洁明确，15-30字）",
    "summary": "详细摘要（客观描述事件经过、关键数据、影响范围，80-150字）",
    "category": "分类（从以下选择：AI, HARDWARE, RESEARCH, POLICY, BUSINESS, ETHICS, APPLICATION）",
    "region": "地区（从以下选择：NORTH_AMERICA, EUROPE, ASIA, GLOBAL）",
    "impact": 70-95的整数（基于行业影响力）,
    "source": "具体来源（如：OpenAI官方博客、TechCrunch、arXiv、GitHub等）"
  }
]

## 优质示例

\`\`\`json
[
  {
    "title": "OpenAI发布GPT-4 Turbo降价50%",
    "summary": "OpenAI宣布GPT-4 Turbo API价格大幅下调，输入token降至每1M token 10美元，输出token降至30美元，降幅达50%。同时推出更新的模型版本gpt-4-turbo-preview，支持128K上下文窗口。此举旨在让更多开发者能够使用先进的AI能力。",
    "category": "BUSINESS",
    "region": "NORTH_AMERICA",
    "impact": 88,
    "source": "OpenAI官方博客"
  },
  {
    "title": "谷歌Gemini 1.5 Pro支持100万token上下文",
    "summary": "Google DeepMind发布Gemini 1.5 Pro，实现了突破性的100万token上下文窗口，是目前上下文长度最长的商用大模型。该模型能够处理长达1小时的视频、11小时的音频或超过70万字的文本。在保持高性能的同时，计算效率显著提升。",
    "category": "AI",
    "region": "NORTH_AMERICA",
    "impact": 92,
    "source": "Google AI博客"
  }
]
\`\`\`

## 注意事项
1. 标题要准确，避免夸大（不用"revolutionary"、"unprecedented"等词）
2. 摘要要包含具体数据和细节
3. impact分数应合理反映实际影响（大多数在70-85之间）
4. source必须是真实可信的来源

CRITICAL: 你的响应必须直接以 [ 开始，以 ] 结束。不要用 \`\`\`json 包裹，不要添加任何解释文字。`;

    const text = await callGLM(prompt);

    // Clean the response more thoroughly
    let cleanedText = text.trim();

    // Remove markdown code blocks
    cleanedText = cleanedText.replace(/^```json\s*/i, '');
    cleanedText = cleanedText.replace(/^```\s*/i, '');
    cleanedText = cleanedText.replace(/\s*```$/i, '');
    cleanedText = cleanedText.trim();

    // Try to extract array if wrapped in text
    const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      cleanedText = arrayMatch[0];
    }

    console.log('📥 Raw GLM response:', text);
    console.log('🧹 Cleaned JSON:', cleanedText);

    const newsData = JSON.parse(cleanedText);

    // Enhanced validation for news quality and authenticity
    const validatedNews = newsData.filter((item: any, index: number) => {
      // 基础字段验证
      const hasValidTitle = item.title &&
                           typeof item.title === 'string' &&
                           item.title.length >= 15 &&
                           item.title.length <= 100;

      const hasValidSummary = item.summary &&
                             typeof item.summary === 'string' &&
                             item.summary.length >= 50 &&
                             item.summary.length <= 500;

      const hasValidSource = item.source &&
                            typeof item.source === 'string' &&
                            item.source.length >= 3;

      const realisticImpact = typeof item.impact === 'number' &&
                             item.impact >= 65 &&
                             item.impact <= 95;

      const validCategory = Object.values(NewsCategory).includes(item.category);
      const validRegion = Object.values(Region).includes(item.region);

      console.log(`🔍 Validating news item ${index + 1}:`, {
        title: item.title?.substring(0, 50) + '...',
        titleLength: item.title?.length,
        summaryLength: item.summary?.length,
        source: item.source,
        impact: item.impact,
        category: item.category,
        region: item.region,
        passed: hasValidTitle && hasValidSummary && hasValidSource &&
                realisticImpact && validCategory && validRegion
      });

      // 基础验证失败直接拒绝
      if (!hasValidTitle || !hasValidSummary || !hasValidSource) {
        console.warn(`❌ Rejected: Missing or invalid required fields`, {
          hasValidTitle,
          hasValidSummary,
          hasValidSource
        });
        return false;
      }

      if (!realisticImpact || !validCategory || !validRegion) {
        console.warn(`❌ Rejected: Invalid metadata`, {
          impact: item.impact,
          category: item.category,
          region: item.region
        });
        return false;
      }

      // 检测夸大和虚假内容的关键词
      const suspiciousKeywords = [
        'revolutionary', 'unprecedented', 'never before',
        'completely changes', 'game changer', 'breakthrough of the century',
        'will revolutionize', '颠覆性', '前所未有', '革命性突破'
      ];

      const contentToCheck = (item.title + ' ' + item.summary).toLowerCase();
      const suspiciousCount = suspiciousKeywords.filter(keyword =>
        contentToCheck.includes(keyword.toLowerCase())
      ).length;

      if (suspiciousCount >= 2) {
        console.warn(`⚠️ Rejected: Too many suspicious/exaggerated keywords (${suspiciousCount})`, item.title);
        return false;
      }

      // 检测摘要质量：应该包含具体信息而不是空泛描述
      const hasNumbers = /\d+/.test(item.summary); // 是否包含数字/数据
      const hasSpecificTerms = /\b(发布|推出|宣布|达到|提升|降低|支持|实现)\b/.test(item.summary);

      if (!hasNumbers && !hasSpecificTerms) {
        console.warn(`⚠️ Warning: Summary lacks specific details`, item.title);
        // 不直接拒绝，但记录警告
      }

      return true;
    });

    console.log(`✅ Validated ${validatedNews.length} out of ${newsData.length} news items`);

    // If no valid items, use fallback
    if (validatedNews.length === 0) {
      console.warn('⚠️ No valid news items found, using fallback data');
      return getFallbackNews();
    }

    // Transform to NewsItem format
    const newsItems: NewsItem[] = validatedNews.map((item: any, index: number) => ({
      id: `glm-${Date.now()}-${index}`,
      title: item.title,
      summary: item.summary,
      category: NewsCategory[item.category as keyof typeof NewsCategory] || NewsCategory.AI,
      region: Region[item.region as keyof typeof Region] || Region.GLOBAL,
      impact: item.impact || 75,
      timestamp: new Date(Date.now() - index * 1800000).toISOString(), // Stagger timestamps
      source: item.source || 'AI News',
      url: '', // No URL needed since we'll use search buttons
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

CRITICAL: 只返回纯 JSON 对象，直接以 { 开始，以 } 结束：
{"content":"...","highlights":["...","..."],"keyTrends":["...","..."]}`
      : `You are an AI news analyst. Based on these top AI news headlines from today, generate a comprehensive daily brief:

${newsTitles}

Generate a daily brief in English with:
1. content: A coherent 3-4 paragraph summary analyzing the day's key developments and their significance
2. highlights: An array of 5-7 key bullet points highlighting the most important takeaways
3. keyTrends: An array of 4-6 trending topics/themes identified from the news

CRITICAL: Return ONLY a raw JSON object starting with { and ending with }. No markdown, no code blocks:
{"content":"...","highlights":["...","..."],"keyTrends":["...","..."]}`;

    const text = await callGLM(prompt);

    // Clean the response more thoroughly
    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/^```json\s*/i, '');
    cleanedText = cleanedText.replace(/^```\s*/i, '');
    cleanedText = cleanedText.replace(/\s*```$/i, '');
    cleanedText = cleanedText.trim();

    // Extract JSON object if wrapped
    const objectMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      cleanedText = objectMatch[0];
    }

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
 * Translate news item to Chinese using GLM API
 */
export async function translateToChinese(newsItem: NewsItem): Promise<{
  translatedTitle: string;
  translatedSummary: string;
}> {
  try {
    const prompt = `Translate the following news item from English to Chinese. The translation should be:

Title: "${newsItem.title}"
Summary: "${newsItem.summary}"

Requirements:
1. Translate the title accurately while keeping it engaging
2. Translate the summary naturally in fluent Chinese
3. Maintain the original meaning and tone
4. Keep technical terms consistent with common Chinese usage
5. Return ONLY the translated title and summary in JSON format

Format: {"translatedTitle": "...", "translatedSummary": "..."}`;

    const response = await callGLM(prompt);
    const cleanedText = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const translatedData = JSON.parse(cleanedText);

    return {
      translatedTitle: translatedData.translatedTitle || newsItem.title,
      translatedSummary: translatedData.translatedSummary || newsItem.summary,
    };
  } catch (error) {
    console.error('Error translating to Chinese:', error);
    return {
      translatedTitle: newsItem.title,
      translatedSummary: newsItem.summary,
    };
  }
}

/**
 * Fallback mock news when API fails
 */
function getFallbackNews(): NewsItem[] {
  const recentEvents = [
    {
      title: 'OpenAI Announces GPT-4 Turbo Improvements This Week',
      summary: 'Latest updates to GPT-4 Turbo show enhanced performance and reduced costs, announced in recent developer updates.',
      category: NewsCategory.AI,
      source: 'OpenAI Dev Blog',
      daysAgo: 2
    },
    {
      title: 'NVIDIA H200 Tensor Core GPUs Begin Shipping to Partners',
      summary: 'NVIDIA\'s latest AI accelerator chips start reaching major cloud providers this week, promising 2x performance over H100.',
      category: NewsCategory.HARDWARE,
      source: 'NVIDIA Newsroom',
      daysAgo: 3
    },
    {
      title: 'Google Gemini 1.5 Pro Available to Enterprise Customers',
      summary: 'Google expands access to its most capable model with enhanced multimodal capabilities for business applications.',
      category: NewsCategory.BUSINESS,
      source: 'Google Cloud Blog',
      daysAgo: 4
    },
    {
      title: 'Anthropic Releases Claude 3.5 with Improved Coding Abilities',
      summary: 'Latest Claude model shows significant improvements in code generation and complex reasoning tasks.',
      category: NewsCategory.RESEARCH,
      source: 'Anthropic Blog',
      daysAgo: 5
    },
    {
      title: 'Meta Open Sources New AI Model Architecture This Month',
      summary: 'Meta releases efficient transformer architecture that promises lower computational costs for similar performance.',
      category: NewsCategory.RESEARCH,
      source: 'Meta AI',
      daysAgo: 6
    },
    {
      title: 'Microsoft Copilot Gets Major Update with Enhanced Integration',
      summary: 'Microsoft rolls out significant improvements to Copilot across Office suite with better context understanding.',
      category: NewsCategory.SOFTWARE,
      source: 'Microsoft 365 Blog',
      daysAgo: 1
    }
  ];

  return recentEvents.map((event, index) => ({
    id: `fallback-${index + 1}`,
    title: event.title,
    summary: event.summary,
    category: event.category as NewsCategory,
    region: Region.GLOBAL,
    impact: 75 + Math.floor(Math.random() * 20), // 75-95 impact
    timestamp: new Date(Date.now() - event.daysAgo * 24 * 60 * 60 * 1000).toISOString(), // Actual days ago
    source: event.source,
    url: '', // Will use search buttons
  }));
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
