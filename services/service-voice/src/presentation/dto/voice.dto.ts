import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TranscribeDto {
  @ApiProperty() @IsString() audioBase64!: string;
  @ApiPropertyOptional({ default: 'pt' }) @IsOptional() @IsString() language?: string;
}

export class SynthesizeDto {
  @ApiProperty() @IsString() text!: string;
  @ApiPropertyOptional({ default: 'en_GB-alan-medium', description: 'Voz Piper (ex.: en_GB-alan-medium.onnx)' }) @IsOptional() @IsString() voice?: string;
}
