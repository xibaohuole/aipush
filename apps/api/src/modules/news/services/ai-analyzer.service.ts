import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface NewsAnalysisResult {
  category: string;
  region: string;
  impactScore: number;
  summary: string;
  whyItMatters: string;
  tags: string[];
}

/**
 * AI 新闻分析服务
 * 使用 GLM API 分析新闻内容
 */
@Injectable()
export class AIAnalyzerService {
  private readonly logger = new Logger(AIAnalyzerService.name);
  private readonly glmApiKey: string;
  private readonly glmApiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

  constructor(private configService: ConfigService) {
    this.glmApiKey = this.configService.get<string>('GLM_API_KEY') || '';
  }

  /**
   * 分析新闻文章
   */
  async analyzeNews(title: string, content: string, sourceCategory?: string): Promise<NewsAnalysisResult> {
    if (!this.glmApiKey) {
      this.logger.warn('GLM API key not configured, using default values');
      return this.getDefaultAnalysis(title, content, sourceCategory);
    }

    try {
      const prompt = this.buildAnalysisPrompt(title, content);
      const response = await this.callGLM(prompt);
      return this.parseGLMResponse(response, sourceCategory);
    } catch (error: any) {
      this.logger.error(`Failed to analyze news: ${error.message}`, error.stack);
      return this.getDefaultAnalysis(title, content, sourceCategory);
    }
  }

  /**
   * 构建分析提示词
   */
  private buildAnalysisPrompt(title: string, content: string): string {
    return `You are a JSON-only API. Analyze this AI news article and respond with ONLY a raw JSON object.

Title: ${title}
Content: ${content.substring(0, 2000)}

Required JSON structure (respond with ONLY this, no markdown, no code blocks, no explanations):
{
  "category": "one of: research, product, finance, policy, ethics, robotics, lifestyle, entertainment, meme, other",
  "region": "one of: global, north_america, europe, asia, other",
  "impactScore": <number 1-10>,
  "summary": "<2-3 sentence summary in English>",
  "whyItMatters": "<1-2 sentences explaining significance>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}

CRITICAL: Your response must start with { and end with }. Do NOT wrap in markdown code blocks. Do NOT add any text before or after the JSON.`;
  }

  /**
   * 调用 GLM API（带重试机制）
   */
  private async callGLM(prompt: string, retries: number = 3): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(this.glmApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.glmApiKey}`,
          },
          body: JSON.stringify({
            model: 'glm-4.5-air',
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
            temperature: 0.1, // 降低温度以获得更一致的格式
            top_p: 0.7,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`GLM API error (${response.status}): ${errorText}`);
        }

        const data: any = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid GLM API response format');
        }

        return data.choices[0].message.content;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `GLM API call failed (attempt ${attempt}/${retries}): ${error.message}`
        );

        if (attempt < retries) {
          // 指数退避：等待 1s, 2s, 4s...
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('GLM API call failed after retries');
  }

  /**
   * 解析 GLM 响应
   */
  private parseGLMResponse(response: string, fallbackCategory?: string): NewsAnalysisResult {
    try {
      // 清理响应：移除可能的 markdown 代码块
      let cleanedResponse = response.trim();

      // 移除 markdown 代码块标记
      cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
      cleanedResponse = cleanedResponse.replace(/^```\s*/i, '');
      cleanedResponse = cleanedResponse.replace(/\s*```$/i, '');
      cleanedResponse = cleanedResponse.trim();

      // 尝试直接解析
      let parsed;
      try {
        parsed = JSON.parse(cleanedResponse);
      } catch (e) {
        // 如果直接解析失败，尝试提取 JSON 对象
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in response');
        }
        parsed = JSON.parse(jsonMatch[0]);
      }

      // 验证必需字段
      if (!parsed.category || !parsed.region || typeof parsed.impactScore !== 'number') {
        this.logger.warn('Response missing required fields, using defaults');
      }

      return {
        category: this.validateCategory(parsed.category) || fallbackCategory || 'other',
        region: this.validateRegion(parsed.region) || 'global',
        impactScore: this.validateImpactScore(parsed.impactScore),
        summary: parsed.summary || 'No summary available',
        whyItMatters: parsed.whyItMatters || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
      };
    } catch (error: any) {
      this.logger.error(`Failed to parse GLM response: ${error.message}`);
      this.logger.debug(`Raw response: ${response}`);
      throw error;
    }
  }

  /**
   * 验证分类
   */
  private validateCategory(category: string): string | null {
    const validCategories = [
      'research', 'product', 'finance', 'policy', 'ethics',
      'robotics', 'lifestyle', 'entertainment', 'meme', 'other'
    ];
    return validCategories.includes(category?.toLowerCase()) ? category.toLowerCase() : null;
  }

  /**
   * 验证区域
   */
  private validateRegion(region: string): string | null {
    const validRegions = ['global', 'north_america', 'europe', 'asia', 'other'];
    return validRegions.includes(region?.toLowerCase()) ? region.toLowerCase() : null;
  }

  /**
   * 验证影响分数
   */
  private validateImpactScore(score: number): number {
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 1 || numScore > 10) {
      return 5; // 默认中等影响
    }
    return Math.round(numScore);
  }

  /**
   * 获取默认分析结果（当 API 不可用时）
   */
  private getDefaultAnalysis(title: string, content: string, sourceCategory?: string): NewsAnalysisResult {
    return {
      category: sourceCategory || 'other',
      region: 'global',
      impactScore: 5,
      summary: content.substring(0, 200) + '...',
      whyItMatters: '',
      tags: this.extractSimpleTags(title),
    };
  }

  /**
   * 简单标签提取（基于标题）
   */
  private extractSimpleTags(title: string): string[] {
    const commonAITerms = ['AI', 'ML', 'GPT', 'LLM', 'neural', 'deep learning', 'ChatGPT', 'OpenAI', 'Google', 'Microsoft'];
    return commonAITerms.filter(term =>
      title.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 3);
  }
}
