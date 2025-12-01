import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheStrategyService } from '../../../common/redis/cache-strategy.service';
import { RedisService } from '../../../common/redis/redis.service';

interface NewsAnalysisResult {
  category: string;
  region: string;
  impactScore: number;
  summary: string;
  whyItMatters: string;
  tags: string[];
  // 中文翻译字段
  titleCn?: string;
  summaryCn?: string;
  whyItMattersCn?: string;
}

/**
 * AI 新闻分析服务
 * 使用 GLM API 分析新闻内容
 */
@Injectable()
export class AIAnalyzerService implements OnModuleInit {
  private readonly logger = new Logger(AIAnalyzerService.name);
  private readonly glmApiKey: string;
  private readonly glmApiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

  constructor(
    private configService: ConfigService,
    private cacheStrategy: CacheStrategyService,
    private redisService: RedisService,
  ) {
    this.glmApiKey = this.configService.get<string>('glm.apiKey') || '';
  }

  /**
   * 模块初始化时执行缓存预热
   */
  async onModuleInit() {
    // 延迟 3 秒后开始预热，避免影响应用启动速度
    setTimeout(() => {
      this.warmupCache();
    }, 3000);
  }

  /**
   * 缓存预热：应用启动时预加载热门新闻
   */
  private async warmupCache() {
    if (!this.glmApiKey) {
      this.logger.log('GLM API key not configured, skipping cache warmup');
      return;
    }

    this.logger.log('Starting AI news cache warmup...');

    try {
      // 生成当前小时的新闻并缓存
      const now = new Date();
      const dateHour = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}`;
      const cacheKey = `ai-news:${dateHour}:count-8`;

      // 检查缓存是否已存在
      const existingCache = await this.cacheStrategy.get(cacheKey);
      if (existingCache) {
        this.logger.log('Cache already exists, skipping warmup');
        return;
      }

      // 生成新闻
      const newsItems = await this.generateNewsInternal(8);

      // 使用智能缓存策略存储
      await this.cacheStrategy.set(cacheKey, newsItems, 1800); // 30分钟

      this.logger.log(`Cache warmup completed: ${newsItems.length} items loaded`);
    } catch (error: any) {
      this.logger.warn(`Cache warmup failed: ${error.message}`);
    }
  }

  /**
   * 分析新闻文章
   */
  async analyzeNews(title: string, content: string, sourceCategory?: string): Promise<NewsAnalysisResult> {
    if (!this.glmApiKey) {
      this.logger.warn('GLM API 密钥未配置，使用默认分析值');
      return this.getDefaultAnalysis(title, content, sourceCategory);
    }

    try {
      this.logger.debug(`开始分析新闻: ${title.substring(0, 50)}...`);
      const prompt = this.buildAnalysisPrompt(title, content);
      const response = await this.callGLM(prompt);
      const result = this.parseGLMResponse(response, sourceCategory);
      this.logger.debug(`新闻分析成功: ${title.substring(0, 50)}... -> 类别: ${result.category}, 中文标题: ${result.titleCn ? '已生成' : '未生成'}`);
      return result;
    } catch (error: any) {
      this.logger.error(`新闻分析失败 [${title.substring(0, 50)}...]: ${error.message}`);
      this.logger.debug(`错误详情: ${error.stack || error.toString()}`);
      this.logger.warn(`使用默认分析降级策略处理: ${title.substring(0, 50)}...`);
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
  "summaryCn": "<2-3句中文摘要>",
  "whyItMatters": "<1-2 sentences explaining significance in English>",
  "whyItMattersCn": "<1-2句中文解释其重要性>",
  "titleCn": "<标题的中文翻译>",
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
        this.logger.debug(`GLM API 调用开始 (第 ${attempt}/${retries} 次尝试)`);

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
          this.logger.error(`GLM API 返回错误状态码 ${response.status}: ${errorText.substring(0, 200)}`);
          throw new Error(`GLM API 错误 (状态码 ${response.status}): ${errorText.substring(0, 100)}`);
        }

        const data: any = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          this.logger.error(`GLM API 响应格式无效: ${JSON.stringify(data).substring(0, 200)}`);
          throw new Error('GLM API 响应格式无效');
        }

        this.logger.debug(`GLM API 调用成功 (第 ${attempt} 次尝试)`);
        return data.choices[0].message.content;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `GLM API 调用失败 (第 ${attempt}/${retries} 次尝试): ${error.message}`
        );

        if (attempt < retries) {
          // 指数退避：等待 1s, 2s, 4s...
          const delay = Math.pow(2, attempt - 1) * 1000;
          this.logger.debug(`等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.logger.error(`GLM API 调用失败，已重试 ${retries} 次: ${lastError?.message || '未知错误'}`);
    throw lastError || new Error('GLM API 调用失败，已达到最大重试次数');
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
        // 中文翻译字段
        titleCn: parsed.titleCn || '',
        summaryCn: parsed.summaryCn || '',
        whyItMattersCn: parsed.whyItMattersCn || '',
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
   * 包含基本的翻译降级策略
   */
  private getDefaultAnalysis(title: string, content: string, sourceCategory?: string): NewsAnalysisResult {
    // 检测文本是否主要是中文
    const isChinese = this.isMostlyChinese(title);

    // 如果原文是中文，直接使用；否则提供基本的提示信息
    const titleCn = isChinese ? title : this.getBasicTranslation(title);
    const summary = content.substring(0, 200) + '...';
    const summaryCn = this.isMostlyChinese(content)
      ? summary
      : '[自动翻译暂不可用] ' + summary;

    return {
      category: sourceCategory || 'other',
      region: 'global',
      impactScore: 5,
      summary,
      whyItMatters: '',
      tags: this.extractSimpleTags(title),
      // 中文翻译字段（使用降级策略）
      titleCn,
      summaryCn,
      whyItMattersCn: '[AI分析服务暂时不可用]',
    };
  }

  /**
   * 检测文本是否主要是中文
   */
  private isMostlyChinese(text: string): boolean {
    if (!text) return false;

    // 计算中文字符的比例
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
    const totalChars = text.replace(/\s/g, '').length;

    return totalChars > 0 && (chineseChars.length / totalChars) > 0.3;
  }

  /**
   * 基本翻译（提供关键词翻译或提示信息）
   */
  private getBasicTranslation(text: string): string {
    if (!text) return '';

    // 如果文本本身就包含中文，直接返回
    if (this.isMostlyChinese(text)) {
      return text;
    }

    // 常见AI术语的简单映射
    const commonTerms: Record<string, string> = {
      'AI': '人工智能',
      'Artificial Intelligence': '人工智能',
      'Machine Learning': '机器学习',
      'Deep Learning': '深度学习',
      'Neural Network': '神经网络',
      'GPT': 'GPT',
      'LLM': '大语言模型',
      'ChatGPT': 'ChatGPT',
      'OpenAI': 'OpenAI',
      'Google': '谷歌',
      'Microsoft': '微软',
      'Meta': 'Meta',
      'Apple': '苹果',
      'Amazon': '亚马逊',
      'NVIDIA': '英伟达',
      'Releases': '发布',
      'Announces': '宣布',
      'Launches': '推出',
      'Introduces': '介绍',
      'Research': '研究',
      'Model': '模型',
      'API': 'API',
      'Update': '更新',
      'New': '新',
      'Breakthrough': '突破',
    };

    // 尝试替换常见术语
    let translated = text;
    for (const [en, cn] of Object.entries(commonTerms)) {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      translated = translated.replace(regex, cn);
    }

    // 如果翻译后仍然大部分是英文，添加提示
    if (!this.isMostlyChinese(translated)) {
      return `[机器翻译] ${text}`;
    }

    return translated;
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

  /**
   * 生成AI新闻摘要（用于前端调用）
   */
  async generateRealtimeNews(count: number = 8): Promise<any[]> {
    if (!this.glmApiKey) {
      this.logger.warn('GLM API key not configured, cannot generate news');
      return [];
    }

    // 生成缓存键（基于日期、小时和数量）- 每小时更新一次
    const now = new Date();
    const dateHour = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}`;
    const cacheKey = `ai-news:${dateHour}:count-${count}`;

    // 尝试从智能缓存获取（支持降级到内存缓存）
    const cachedNews = await this.cacheStrategy.get<any[]>(cacheKey);
    if (cachedNews) {
      this.logger.log(`Returning cached news for ${dateHour} (${cachedNews.length} items)`);
      return cachedNews;
    }

    this.logger.log(`Cache miss for ${cacheKey}, generating new news...`);

    const newsItems = await this.generateNewsInternal(count);

    // 使用更短的缓存时间（30分钟），确保用户能更快看到新内容
    await this.cacheStrategy.set(cacheKey, newsItems, 1800); // 30分钟
    this.logger.log(`Cached ${newsItems.length} news items for ${dateHour}`);

    return newsItems;
  }

  /**
   * 内部新闻生成方法（不涉及缓存）
   */
  private async generateNewsInternal(count: number): Promise<any[]> {
    const dedupeSetKey = 'ai-news:titles:dedupe';
    const maxRetries = 3; // 最多重试3次
    let allNewsItems: any[] = [];

    try {
      // 获取已存在的标题hash集合
      const existingTitles = await this.redisService.sMembers(dedupeSetKey);
      this.logger.log(`Found ${existingTitles.length} existing news titles in Redis`);

      for (let retry = 0; retry < maxRetries && allNewsItems.length < count; retry++) {
        const remainingCount = count - allNewsItems.length;
        // 请求稍微多一些，以防去重后不够数量
        const requestCount = Math.min(remainingCount + 5, 30);

        this.logger.log(`Generating ${requestCount} news items (attempt ${retry + 1}/${maxRetries})...`);

        const todayFormatted = new Date().toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const prompt = `你是一个JSON-only API。请基于你的知识库，生成${requestCount}条最近一周内的AI行业新闻。

## 核心要求
- 今天是 ${todayFormatted}
- 只提供**真实、可验证**的新闻，不要编造或推测
- 如果不确定某件事，宁可不提及
- 基于真实的公司发布、媒体报道或研究论文
- **每条新闻必须有完全不同的标题和内容**，严格避免任何形式的重复

## 输出格式
返回一个纯 JSON 数组（不要用 markdown 代码块包裹），每条新闻包含以下字段：

[
  {
    "title": "新闻标题（英文，简洁明确，15-30字）",
    "titleCn": "新闻标题（中文翻译，15-30字）",
    "summary": "详细摘要（英文，客观描述事件经过、关键数据、影响范围，80-150字）",
    "summaryCn": "详细摘要（中文翻译，客观描述事件经过、关键数据、影响范围，80-150字）",
    "category": "分类（从以下选择：AI, HARDWARE, RESEARCH, POLICY, BUSINESS, ETHICS, APPLICATION）",
    "region": "地区（从以下选择：NORTH_AMERICA, EUROPE, ASIA, GLOBAL）",
    "impact": 70-95的整数（基于行业影响力）,
    "source": "具体来源（如：OpenAI官方博客、TechCrunch、arXiv、GitHub等）",
    "sourceUrl": "新闻来源URL（如果有的话，必须是真实可访问的URL）"
  }
]`;

        const response = await this.callGLM(prompt);

        // 清理响应
        let cleanedResponse = response.trim();
        cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
        cleanedResponse = cleanedResponse.replace(/^```\s*/i, '');
        cleanedResponse = cleanedResponse.replace(/\s*```$/i, '');
        cleanedResponse = cleanedResponse.trim();

        const newsItems = JSON.parse(cleanedResponse);

        if (!Array.isArray(newsItems)) {
          this.logger.error('GLM response is not an array');
          continue;
        }

        // 为每条AI新闻生成唯一的sourceUrl并去重
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const hourStr = String(now.getHours()).padStart(2, '0');

        for (const item of newsItems) {
          const titleHash = this.simpleHash(item.title || item.titleCn || '');

          // 检查标题hash是否已存在
          const isDuplicate = existingTitles.includes(titleHash);

          if (!isDuplicate) {
            // 生成唯一的sourceUrl
            if (!item.sourceUrl) {
              item.sourceUrl = `https://ai-news-generated/${dateStr}/${hourStr}/${titleHash}-${allNewsItems.length}`;
            }

            allNewsItems.push(item);
            existingTitles.push(titleHash);

            // 添加到Redis Set用于去重（24小时过期）
            await this.redisService.sAdd(dedupeSetKey, titleHash);

            if (allNewsItems.length >= count) {
              break;
            }
          } else {
            this.logger.debug(`Skipping duplicate news: ${item.title || item.titleCn}`);
          }
        }

        this.logger.log(`Collected ${allNewsItems.length}/${count} unique news items`);
      }

      // 为去重集合设置24小时过期时间
      if (allNewsItems.length > 0) {
        await this.redisService.expire(dedupeSetKey, 86400); // 24小时
      }

      this.logger.log(`Generated ${allNewsItems.length} unique news items after deduplication`);
      return allNewsItems;

    } catch (error: any) {
      this.logger.error(`Failed to generate realtime news: ${error.message}`, error.stack);
      return allNewsItems; // 返回已收集的新闻，即使出错
    }
  }

  /**
   * 简单的字符串hash函数
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}
