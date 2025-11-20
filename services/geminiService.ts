
import { GoogleGenAI } from "@google/genai";
import { NewsItem, NewsCategory, DailySummary, Region } from "../types";
import { MOCK_SOURCES, RAW_NEWS_FEED, MOCK_COMMENTS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches real-time news using Google Search Grounding.
 * Falls back to the static RAW_NEWS_FEED if search fails.
 */
export const fetchRealtimeNews = async (): Promise<NewsItem[]> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    return [];
  }

  try {
    // STRICT LIMIT: 8-12 items
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "List exactly 10 of the most critical, high-impact Artificial Intelligence news headlines from the last 24 hours. Focus on Funding, Research, Product launches, and Policy. Include 1 viral/meme topic if available.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const lines = text.split('\n');
    const realHeadlines = lines
      .map(line => line.trim())
      .filter(line => /^\d+[\.\)]|^\*|^-/.test(line))
      .map(line => line.replace(/^[\d\-\*\•\)]+\.?\s*/, ''))
      .filter(line => line.length > 10);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks
      .map(chunk => chunk.web?.uri)
      .filter((uri): uri is string => !!uri);

    if (realHeadlines.length > 0) {
      const processedItems = await processRawNews(realHeadlines.slice(0, 12));
      
      return processedItems.map((item, index) => {
        const sourceIndex = index < webSources.length ? index : index % webSources.length;
        const mainSource = webSources[sourceIndex];
        const relatedSources = webSources.slice(Math.max(0, sourceIndex - 1), sourceIndex + 2);
        
        return {
          ...item,
          url: mainSource || item.url,
          citations: relatedSources.length > 0 ? relatedSources : item.citations
        };
      });
    }
  } catch (error) {
    console.error("Error fetching realtime news (grounding):", error);
  }

  return processRawNews(RAW_NEWS_FEED);
};

export const processRawNews = async (rawHeadlines: string[]): Promise<NewsItem[]> => {
  if (!process.env.API_KEY || rawHeadlines.length === 0) return [];

  const CHUNK_SIZE = 4;
  const batches = [];
  for (let i = 0; i < rawHeadlines.length; i += CHUNK_SIZE) {
    batches.push(rawHeadlines.slice(i, i + CHUNK_SIZE));
  }

  try {
    const chunkResults = await Promise.all(batches.map(async (batch, batchIndex) => {
      const prompt = `
        You are a cynical, high-level AI analyst. Analyze these headlines.
        
        Headlines:
        ${batch.map((h, i) => `${i + 1}. ${h}`).join('\n')}

        Return a JSON object with a "news" array.
        Schema:
        {
          "title": "String (Catchy, click-worthy, max 10 words)",
          "summary": "String (Extremely concise, 3-5 lines max. Just the facts.)",
          "whyItMatters": "String (One sentence explaining the strategic impact/consequence. Start with 'Why it matters: ...')",
          "category": "String (Funding, Research, Product, Policy, Ethics, Robotics, Lifestyle, Entertainment, Meme, Other)",
          "region": "String (Global, North America, Europe, Asia, Other)",
          "impactScore": "Number (1-10)",
          "source": "String (Publisher)"
        }
        
        Do NOT format as markdown. Return pure JSON.
      `;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        const text = response.text;
        if (!text) return [];
        const data = JSON.parse(text);
        return Array.isArray(data.news) ? data.news : [];
      } catch (err) {
        console.warn(`Batch ${batchIndex} processing failed:`, err);
        return [];
      }
    }));

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
      comments: MOCK_COMMENTS.sort(() => 0.5 - Math.random()).slice(0, 2) // Random mock comments
    }));

  } catch (error) {
    console.error("Error processing news with Gemini:", error);
    return [];
  }
};

export const generateDailyBriefing = async (newsItems: NewsItem[], language: string = 'English'): Promise<DailySummary | null> => {
  if (!process.env.API_KEY || newsItems.length === 0) return null;

  const context = newsItems.slice(0, 10).map(n => `- ${n.title}: ${n.whyItMatters}`).join('\n');

  const prompt = `
    Write a "Daily AI Pulse" audio script summary.
    Language: ${language}.
    Style: Professional podcast host, energetic but concise.
    
    Items:
    ${context}

    Return JSON:
    {
      "headline": "String (Title)",
      "keyTakeaways": ["String", "String", "String"],
      "bodyContent": "String (Podcast script format)",
      "trendingTopics": ["String", "String"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const summary = JSON.parse(response.text || "{}");
    return {
      ...summary,
      date: new Date().toLocaleDateString()
    };

  } catch (error) {
    return null;
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!process.env.API_KEY || !text || targetLanguage === 'English') return text;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Translate to Native ${targetLanguage} (avoid translationese, make it sound local): "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (error) {
    return text;
  }
};

// New: Ask AI about a specific news item
export const askAI = async (question: string, context: NewsItem): Promise<string> => {
  if (!process.env.API_KEY) return "AI unavailable.";
  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Context: News Article titled "${context.title}". Summary: "${context.summary}". Why it matters: "${context.whyItMatters}".
      
      User Question: "${question}"
      
      Answer concisely in the same language as the question.`,
    });
    return response.text || "No answer generated.";
  } catch (e) {
    return "Error reaching AI.";
  }
}
