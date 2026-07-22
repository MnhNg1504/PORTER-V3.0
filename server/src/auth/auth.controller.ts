import { Body, Controller, Get, Post, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiProperty, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { OauthService } from './oauth.service';
import { RegisterDto, LoginDto, RefreshDto } from './dto/auth.dto';
import type { JwtPayload } from './jwt.strategy';

class OauthTokenDto {
  @ApiProperty({ description: 'ID token từ SDK đăng nhập trên app' })
  @IsString()
  @MinLength(20)
  token: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private oauth: OauthService) {}

  @Post('register')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 10 } }) // siết chống brute-force
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  /** Đăng nhập Google (checklist §1) — hoạt động khi đã set GOOGLE_CLIENT_ID */
  @Post('google')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async google(@Body() dto: OauthTokenDto) {
    const profile = await this.oauth.verifyGoogle(dto.token);
    return this.auth.oauthLogin(profile);
  }

  /** Đăng nhập Apple — stub 501 tới khi có Apple Developer (docs/05 §6) */
  @Post('apple')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async apple(@Body() dto: OauthTokenDto) {
    const profile = await this.oauth.verifyApple(dto.token);
    return this.auth.oauthLogin(profile);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  /** Link trong email xác thực trỏ về đây (checklist §7) */
  @Get('verify-email')
  @ApiQuery({ name: 'token' })
  verifyEmail(@Query('token') token: string) {
    return this.auth.verifyEmail(token);
  }

  @Post('resend-verification')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  resend(@Req() req: { user: JwtPayload }) {
    return this.auth.resendVerification(req.user.sub);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  logout(@Req() req: { user: JwtPayload }) {
    return this.auth.logout(req.user.sub);
  }
}
