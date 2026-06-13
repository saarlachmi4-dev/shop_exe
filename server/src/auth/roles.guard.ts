import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../entities/user.entity.js';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('גישה נדחתה: אין לך הרשאות מתאימות לביצוע פעולה זו.');
    }

    return true;
  }
}
