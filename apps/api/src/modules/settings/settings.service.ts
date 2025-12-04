import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取系统设置（如果不存在则创建默认设置）
   */
  async getSettings() {
    // 尝试获取第一条设置记录
    let settings = await this.prisma.settings.findFirst();

    // 如果不存在，创建默认设置
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          siteName: "AI Pulse Daily",
          siteDescription: "Your daily AI news aggregation platform",
          itemsPerPage: 20,
          commentsEnabled: true,
          autoApproveComments: false,
          apiBaseUrl: "http://localhost:4000",
        },
      });
    }

    return settings;
  }

  /**
   * 更新系统设置
   */
  async updateSettings(updateSettingsDto: UpdateSettingsDto) {
    // 获取现有设置
    const existingSettings = await this.getSettings();

    // 更新设置
    const updatedSettings = await this.prisma.settings.update({
      where: { id: existingSettings.id },
      data: updateSettingsDto,
    });

    return updatedSettings;
  }

  /**
   * 重置为默认设置
   */
  async resetSettings() {
    const existingSettings = await this.getSettings();

    const resetSettings = await this.prisma.settings.update({
      where: { id: existingSettings.id },
      data: {
        siteName: "AI Pulse Daily",
        siteDescription: "Your daily AI news aggregation platform",
        itemsPerPage: 20,
        commentsEnabled: true,
        autoApproveComments: false,
        glmApiKey: null,
        apiBaseUrl: "http://localhost:4000",
      },
    });

    return resetSettings;
  }
}
