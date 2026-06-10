import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageRequestDto {
  @ApiProperty({ example: 'JARVIS, qual é a previsão do tempo hoje?' })
  @IsString()
  @MinLength(1)
  message!: string;

  @ApiPropertyOptional({ example: 'session-uuid' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
