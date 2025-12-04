import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

// Services
import { RSSParserService } from "./services/rss-parser.service";
import { AIAnalyzerService } from "./services/ai-analyzer.service";
import { NewsScraperService } from "./services/news-scraper.service";
import { SourceHealthService } from "./services/source-health.service";
import { BookmarkService } from "./services/bookmark.service";
import { ReadHistoryService } from "./services/read-history.service";

// Controllers
import { NewsScraperController } from "./controllers/news-scraper.controller";
import { NewsController } from "./controllers/news.controller";
import { BookmarkController } from "./controllers/bookmark.controller";
import { ReadHistoryController } from "./controllers/read-history.controller";

// Schedulers
import { NewsScraperScheduler } from "./schedulers/news-scraper.scheduler";

@Module({
  imports: [ConfigModule],
  controllers: [
    NewsScraperController,
    NewsController,
    BookmarkController,
    ReadHistoryController,
  ],
  providers: [
    RSSParserService,
    AIAnalyzerService,
    NewsScraperService,
    SourceHealthService,
    BookmarkService,
    ReadHistoryService,
    NewsScraperScheduler,
  ],
  exports: [
    NewsScraperService,
    SourceHealthService,
    BookmarkService,
    ReadHistoryService,
  ],
})
export class NewsModule {}
