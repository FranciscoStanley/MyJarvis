import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { UserRole } from '@myjarvis/shared';
import {
  JwtAuthGuard,
  RolesGuard,
  Roles,
  Public,
  AuthenticatedRequest,
  AuthThrottle,
} from '@myjarvis/nest-auth';
import {
  RegisterRequestDto,
  LoginRequestDto,
  LdapLoginRequestDto,
  AssignRoleRequestDto,
  AcceptTermsRequestDto,
} from './dto/auth.dto';
import {
  RegisterUserUseCase,
  AuthenticateUserUseCase,
  AuthenticateLdapUseCase,
  GetProfileUseCase,
  ListUsersUseCase,
  AssignRoleUseCase,
  AcceptTermsUseCase,
} from '../application/use-cases/auth.use-cases';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly authenticateUser: AuthenticateUserUseCase,
    private readonly authenticateLdap: AuthenticateLdapUseCase,
    private readonly getProfile: GetProfileUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly assignRole: AssignRoleUseCase,
    private readonly acceptTerms: AcceptTermsUseCase,
  ) {}

  @Public()
  @AuthThrottle()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário (papel: user)' })
  @ApiResponse({ status: 201, description: 'Usuário criado' })
  async register(@Body() dto: RegisterRequestDto) {
    const user = await this.registerUser.execute(dto);
    return { success: true, data: user, timestamp: new Date().toISOString() };
  }

  @Public()
  @AuthThrottle()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({ summary: 'Autenticar com email e senha (local)' })
  async login(@Body() dto: LoginRequestDto, @Req() req: Request) {
    const result = await this.authenticateUser.execute(dto, { ip: req.ip });
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  @Public()
  @AuthThrottle()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login/ldap')
  @ApiOperation({ summary: 'Autenticar via LDAP / Active Directory' })
  async loginLdap(@Body() dto: LdapLoginRequestDto, @Req() req: Request) {
    const result = await this.authenticateLdap.execute(dto, { ip: req.ip });
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perfil do usuário autenticado (inclui roles e aceite de termos)' })
  async profile(@Req() req: AuthenticatedRequest) {
    const user = await this.getProfile.execute(req.user.sub);
    return { success: true, data: user, timestamp: new Date().toISOString() };
  }

  @Post('accept-terms')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aceitar Termos de Uso e Política de Privacidade (uma vez por versão)' })
  async acceptTermsEndpoint(@Req() req: AuthenticatedRequest, @Body() dto: AcceptTermsRequestDto) {
    const user = await this.acceptTerms.execute(req.user.sub, dto.acceptTerms);
    return { success: true, data: user, timestamp: new Date().toISOString() };
  }

  @Get('users')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Listar usuários' })
  async users() {
    const data = await this.listUsers.execute();
    return { success: true, data, timestamp: new Date().toISOString() };
  }

  @Patch('users/:id/role')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Atribuir papel (user | admin)' })
  async updateRole(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: AssignRoleRequestDto,
  ) {
    const actorRoles = req.user.roles;
    const user = await this.assignRole.execute(actorRoles, id, dto.role);
    return { success: true, data: user, timestamp: new Date().toISOString() };
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Health check' })
  check() {
    return { status: 'ok', service: 'service-auth', version: '1.0.0', uptime: process.uptime() };
  }
}
