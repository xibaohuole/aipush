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
    return `Analyze this AI news article and provide a structured response in JSON format.

Title: ${title}
Content: ${content.substring(0, 2000)}

Please analyze and return ONLY a valid JSON object with the following structure:
{
  "category": "one of: research, product, finance, policy, ethics, robotics, lifestyle, entertainment, meme, other",
  "region": "one of: global, north_america, europe, asia, other",
  "impactScore": <number 1-10>,
  "summary": "<2-3 sentence summary in English>",
  "whyItMatters": "<1-2 sentences explaining significance>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}

Analysis criteria:
- Category: Choose the most appropriate category based on content
- Region: Determine the primary geographic focus
- ImpactScore: Rate 1-10 based on significance to AI field
- Summary: Concise overview of key points
- WhyItMatters: Explain the broader implications
- Tags: 3-5 relevant keywords

Return ONLY the JSON object, no additional text.`;
  }

  /**
   * 调用 GLM API
   */
  private async callGLM(prompt: string): Promise<string> {
    const response = await fetch(this.glmApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.glmApiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // 较低温度以获得更一致的结果
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
  }

  /**
   * 解析 GLM 响应
   */
  private parseGLMResponse(response: string, fallbackCategory?: string): NewsAnalysisResult {
    try {
      // 尝试提取 JSON 对象
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

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
