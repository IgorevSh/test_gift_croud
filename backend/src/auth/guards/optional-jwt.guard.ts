import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
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

  private extractTokenFromHeader(request: Request): string | undefined {
    const auth = request.headers.authorization ?? request.headers['authorization'];
    if (typeof auth === 'string') {
      const [type, token] = auth.split(' ');
      if (type === 'Bearer' && token?.trim()) return token.trim();
    }
    const xToken = request.headers['x-auth-token'];
    if (typeof xToken === 'string' && xToken.trim()) return xToken.trim();
    return undefined;
  }
}
