import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const token = authHeader.split(' ')[1];
      request.user = this.jwtService.verify(token, { secret: 'SUPER_SECRET_KEY_123' });
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
