import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Services
import { RSSParserService } from './services/rss-parser.service';
import { AIAnalyzerService } from './services/ai-analyzer.service';
import { NewsScraperService } from './services/news-scraper.service';

// Controllers
import { NewsScraperController } from './controllers/news-scraper.controller';
import { NewsController } from './controllers/news.controller';

// Schedulers
import { NewsScraperScheduler } from './schedulers/news-scraper.scheduler';

@Module({
  imports: [ConfigModule],
  controllers: [NewsScraperController, NewsController],
  providers: [
    RSSParserService,
    AIAnalyzerService,
    NewsScraperService,
    NewsScraperScheduler,
  ],
  exports: [NewsScraperService],
})
export class NewsModule {}
