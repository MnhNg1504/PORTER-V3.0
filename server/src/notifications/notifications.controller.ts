import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsIn, IsString, Matches } from 'class-validator';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/auth.decorators';
import type { JwtPayload } from '../auth/jwt.strategy';

class RegisterTokenDto {
  @ApiProperty({ example: 'ExponentPushToken[xxxxxxxxxxxx]' })
  @IsString()
  @Matches(/^Expo(nent)?PushToken\[.+\]$/, { message: 'Không phải Expo push token hợp lệ' })
  token: string;

  @ApiProperty({ enum: ['android', 'ios'] })
  @IsIn(['android', 'ios'])
  platform: 'android' | 'ios';
}

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Post('register')
  register(@CurrentUser() user: JwtPayload, @Body() dto: RegisterTokenDto) {
    return this.notifications.register(user.sub, dto.token, dto.platform);
  }

  @Delete('register/:token')
  unregister(@Param('token') token: string) {
    return this.notifications.unregister(token);
  }
}
