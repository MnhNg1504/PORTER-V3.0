import {
  SetMetadata, createParamDecorator, ExecutionContext, CanActivate, Injectable, ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { JwtPayload } from '../auth/jwt.strategy';

export const ROLES_KEY = 'roles';
export const MIN_TIER_KEY = 'minTier';

/** @Roles('admin') — chỉ admin (checklist §3: phân quyền Admin/User) */
export const Roles = (...roles: Array<'user' | 'admin'>) => SetMetadata(ROLES_KEY, roles);

/** @MinTier(2) — chặn theo cấp user (docs/04: cấp 2+ mới được mở/bán cung) */
export const MinTier = (tier: 1 | 2 | 3) => SetMetadata(MIN_TIER_KEY, tier);

/** @CurrentUser() trong handler đã qua AuthGuard('jwt') */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtPayload =>
    ctx.switchToHttp().getRequest().user,
);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]);
    const minTier = this.reflector.getAllAndOverride<number>(MIN_TIER_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]);
    const user: JwtPayload | undefined = ctx.switchToHttp().getRequest().user;
    if (!roles && !minTier) return true;
    if (!user) throw new ForbiddenException('Chưa đăng nhập');
    if (roles && !roles.includes(user.role)) throw new ForbiddenException('Cần quyền admin');
    if (minTier && user.role !== 'admin' && user.tier < minTier) {
      throw new ForbiddenException(`Cần user Cấp ${minTier} trở lên (docs/04)`);
    }
    return true;
  }
}
