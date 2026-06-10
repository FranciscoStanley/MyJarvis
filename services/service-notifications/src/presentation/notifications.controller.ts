import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SendNotificationDto } from './dto/notification.dto';
import { SendNotificationUseCase, GetUserNotificationsUseCase, MarkNotificationReadUseCase } from '../application/use-cases/notification.use-cases';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly send: SendNotificationUseCase,
    private readonly getUser: GetUserNotificationsUseCase,
    private readonly markRead: MarkNotificationReadUseCase,
  ) {}

  @Post('send')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar notificação' })
  async sendNotification(@Body() dto: SendNotificationDto) {
    const data = await this.send.execute(dto);
    return { success: true, data, timestamp: new Date().toISOString() };
  }

  @Get('user/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar notificações do usuário' })
  async list(@Param('userId') userId: string) {
    const data = await this.getUser.execute(userId);
    return { success: true, data, timestamp: new Date().toISOString() };
  }

  @Patch(':id/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  async read(@Param('id') id: string) {
    const data = await this.markRead.execute(id);
    return { success: true, data, timestamp: new Date().toISOString() };
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get() check() { return { status: 'ok', service: 'service-notifications', version: '1.0.0' }; }
}
