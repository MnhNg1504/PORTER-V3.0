import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/auth.decorators';
import type { JwtPayload } from '../auth/jwt.strategy';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.users.getProfile(user.sub);
  }

  @Get(':id')
  byId(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.getProfile(id);
  }
}
