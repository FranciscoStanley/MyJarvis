import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TranscribeDto {
  @ApiProperty() @IsString() audioBase64!: string;
  @ApiPropertyOptional({ default: 'pt' }) @IsOptional() @IsString() language?: string;
}

export class SynthesizeDto {
  @ApiProperty() @IsString() text!: string;
  @ApiPropertyOptional({ default: 'pt_BR-faber-medium', description: 'Voz Piper (ex.: pt_BR-faber-medium.onnx)' }) @IsOptional() @IsString() voice?: string;
}
