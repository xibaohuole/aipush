import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>("database.url"),
        },
      },
      log: [
        { level: "query", emit: "event" },
        { level: "error", emit: "stdout" },
        { level: "warn", emit: "stdout" },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("Database connected successfully");

      // Log queries in development
      if (this.configService.get("nodeEnv") === "development") {
        (this as any).$on("query", (e: any) => {
          this.logger.debug(`Query: ${e.query}`);
          this.logger.debug(`Duration: ${e.duration}ms`);
        });
      }
    } catch (error) {
      this.logger.error("Failed to connect to database", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Database disconnected");
  }

  async cleanDatabase() {
    if (this.configService.get("nodeEnv") === "production") {
      throw new Error("Cannot clean database in production!");
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === "string" && key[0] !== "_" && key[0] !== "$",
    ) as string[];

    return Promise.all(
      models.map((modelKey) => {
        return (this as any)[modelKey].deleteMany();
      }),
    );
  }
}
