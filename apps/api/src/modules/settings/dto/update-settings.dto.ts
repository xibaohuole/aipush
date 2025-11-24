import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsBoolean,
  IsUrl,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({
    description: 'Site name',
    example: 'AI Pulse Daily',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  siteName?: string;

  @ApiProperty({
    description: 'Site description',
    example: 'Your daily AI news aggregation platform',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  siteDescription?: string;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    minimum: 5,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(100)
  itemsPerPage?: number;

  @ApiProperty({
    description: 'Enable comments',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  commentsEnabled?: boolean;

  @ApiProperty({
    description: 'Auto approve comments',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  autoApproveComments?: boolean;

  @ApiProperty({
    description: 'GLM API Key',
    example: 'sk-xxx',
    required: false,
  })
  @IsOptional()
  @IsString()
  glmApiKey?: string;

  @ApiProperty({
    description: 'API base URL',
    example: 'http://localhost:4000',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  apiBaseUrl?: string;
}
