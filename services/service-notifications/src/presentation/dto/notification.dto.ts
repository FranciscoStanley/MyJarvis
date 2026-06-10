import { IsString, IsIn, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty() @IsString() userId!: string;
  @ApiProperty() @IsString() title!: string;
  @ApiProperty() @IsString() body!: string;
  @ApiProperty({ enum: ['info', 'alert', 'reminder'] }) @IsIn(['info', 'alert', 'reminder']) type!: 'info' | 'alert' | 'reminder';
  @ApiPropertyOptional() @IsOptional() @IsObject() data?: Record<string, unknown>;
}
