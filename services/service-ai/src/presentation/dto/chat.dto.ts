import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageRequestDto {
  @ApiProperty({
    example: 'Abra o YouTube na música Espírito Santo',
    description:
      'Mensagem do usuário. Comandos imperativos (abra, toque, entre, busque no google) disparam ações executáveis.',
  })
  @IsString()
  @MinLength(1)
  message!: string;

  @ApiPropertyOptional({ example: 'session-uuid', description: 'Omitir para criar sessão implícita na primeira mensagem' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
