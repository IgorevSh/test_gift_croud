import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { AUTH_COOKIE_NAME } from '../constants';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      request['user'] = undefined;
      return true;
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.authService.findById(payload.sub);
      request['user'] = user ?? undefined;
    } catch {
      request['user'] = undefined;
    }
    return true;
  }

  private extractToken(request: Request): string | undefined {
    const cookieHeader = request.headers.cookie;
    if (typeof cookieHeader === 'string') {
      const tokenFromCookie = this.extractTokenFromCookie(cookieHeader);
      if (tokenFromCookie) return tokenFromCookie;
    }

    const auth = request.headers.authorization;
    if (typeof auth === 'string') {
      const [type, token] = auth.split(' ');
      if (type === 'Bearer' && token?.trim()) return token.trim();
    }
    const xToken = request.headers['x-auth-token'];
    if (typeof xToken === 'string' && xToken.trim()) return xToken.trim();
    return undefined;
  }

  private extractTokenFromCookie(cookieHeader: string): string | undefined {
    const pairs = cookieHeader.split(';');
    for (const pair of pairs) {
      const [rawKey, ...rest] = pair.split('=');
      if (!rawKey || rest.length === 0) continue;
      const key = rawKey.trim();
      if (key !== AUTH_COOKIE_NAME) continue;
      return decodeURIComponent(rest.join('='));
    }
    return undefined;
  }
}
