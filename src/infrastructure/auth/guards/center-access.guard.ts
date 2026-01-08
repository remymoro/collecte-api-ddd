import { AuthenticatedUser } from '@application/auth/authenticated-user.output';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';


@Injectable()
export class CenterAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.user as AuthenticatedUser;
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const centerIdFromRequest =
      request.params?.centerId ??
      request.body?.centerId;

    if (!centerIdFromRequest) {
      throw new ForbiddenException(
        'Missing centerId in request',
      );
    }

    if (user.centerId !== centerIdFromRequest) {
      throw new ForbiddenException(
        'Access denied: wrong active center',
      );
    }

    return true;
  }
}
