import { Controller, Post, Get, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { RegisterRequestDto, LoginRequestDto } from './dto/auth.dto';
import {
  RegisterUserUseCase,
  AuthenticateUserUseCase,
  GetProfileUseCase,
} from '../application/use-cases/auth.use-cases';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly authenticateUser: AuthenticateUserUseCase,
    private readonly getProfile: GetProfileUseCase,
    private readonly jwt: JwtService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado' })
  async register(@Body() dto: RegisterRequestDto) {
    const user = await this.registerUser.execute(dto);
    return { success: true, data: user, timestamp: new Date().toISOString() };
  }

  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiResponse({ status: 200, description: 'Token JWT retornado' })
  async login(@Body() dto: LoginRequestDto) {
    const result = await this.authenticateUser.execute(dto);
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  async profile(@Headers('authorization') auth: string) {
    const userId = this.extractUserId(auth);
    const user = await this.getProfile.execute(userId);
    return { success: true, data: user, timestamp: new Date().toISOString() };
  }

  private extractUserId(auth: string): string {
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException();
    const payload = this.jwt.verify(auth.slice(7)) as { sub: string };
    return payload.sub;
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  check() {
    return { status: 'ok', service: 'service-auth', version: '1.0.0', uptime: process.uptime() };
  }
}
