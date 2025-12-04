import { Injectable, Logger } from "@nestjs/common";
import Parser from "rss-parser";

export interface ParsedNewsItem {
  title: string;
  link: string;
  content: string;
  publishedAt: Date;
  source: string;
  author?: string;
}

/**
 * RSS 解析服务
 */
@Injectable()
export class RSSParserService {
  private readonly logger = new Logger(RSSParserService.name);
  private readonly parser: Parser;

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        "User-Agent": "AI-Pulse-Daily-Bot/1.0",
      },
      customFields: {
        item: [
          ["content:encoded", "contentEncoded"],
          ["description", "description"],
          ["summary", "summary"],
        ],
      },
    });
  }

  /**
   * 解析 RSS feed
   */
  async parseFeed(
    feedUrl: string,
    sourceName: string,
  ): Promise<ParsedNewsItem[]> {
    try {
      this.logger.log(`Parsing RSS feed: ${sourceName} (${feedUrl})`);

      const feed = await this.parser.parseURL(feedUrl);

      if (!feed.items || feed.items.length === 0) {
        this.logger.warn(`No items found in feed: ${sourceName}`);
        return [];
      }

      const items: ParsedNewsItem[] = feed.items
        .filter((item) => item.link && item.title)
        .map((item) => ({
          title: this.cleanText(item.title || ""),
          link: item.link || "",
          content: this.extractContent(item),
          publishedAt: this.parseDate(item.pubDate || item.isoDate),
          source: sourceName,
          author: item.creator || item.author || undefined,
        }))
        .filter((item) => this.isRecentNews(item.publishedAt));

      this.logger.log(
        `Successfully parsed ${items.length} items from ${sourceName}`,
      );

      return items;
    } catch (error: any) {
      this.logger.error(
        `Failed to parse RSS feed ${sourceName}: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * 提取内容
   */
  private extractContent(item: any): string {
    // 优先级: content:encoded > description > summary
    const content =
      item.contentEncoded ||
      item.content ||
      item.description ||
      item.summary ||
      "";

    return this.cleanContent(content);
  }

  /**
   * 清理 HTML 标签和多余空格
   */
  private cleanContent(html: string): string {
    if (!html) return "";

    // 移除 HTML 标签
    let text = html.replace(/<[^>]*>/g, " ");

    // 解码 HTML 实体
    text = this.decodeHTMLEntities(text);

    // 移除多余空格和换行
    text = text.replace(/\s+/g, " ").trim();

    // 限制长度
    return text.substring(0, 5000);
  }

  /**
   * 清理文本
   */
  private cleanText(text: string): string {
    if (!text) return "";

    let cleaned = this.decodeHTMLEntities(text);
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    return cleaned;
  }

  /**
   * 解码 HTML 实体
   */
  private decodeHTMLEntities(text: string): string {
    const entities: { [key: string]: string } = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
      "&nbsp;": " ",
      "&mdash;": "—",
      "&ndash;": "–",
      "&hellip;": "...",
    };

    return text.replace(/&[^;]+;/g, (match) => entities[match] || match);
  }

  /**
   * 解析日期
   */
  private parseDate(dateString?: string): Date {
    if (!dateString) {
      return new Date();
    }

    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? new Date() : date;
    } catch (error) {
      this.logger.warn(`Failed to parse date: ${dateString}`);
      return new Date();
    }
  }

  /**
   * 检查是否为最近的新闻（7天内）
   */
  private isRecentNews(publishedAt: Date): boolean {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return publishedAt >= sevenDaysAgo;
  }

  /**
   * 批量解析多个 RSS feeds
   */
  async parseMultipleFeeds(
    feeds: Array<{ url: string; name: string }>,
  ): Promise<ParsedNewsItem[]> {
    const results = await Promise.allSettled(
      feeds.map((feed) => this.parseFeed(feed.url, feed.name)),
    );

    const allItems: ParsedNewsItem[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        allItems.push(...result.value);
      } else {
        this.logger.error(
          `Failed to parse feed ${feeds[index].name}: ${result.reason}`,
        );
      }
    });

    return allItems;
  }
}
