import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

export type CurrentUserPayload = {
  id: string;
  role: 'BENEVOLE';
  currentCenterId: string;
};

@Injectable()
export class FakeAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user: CurrentUserPayload = {
      id: 'user-demo',
      role: 'BENEVOLE',
      currentCenterId: 'center-demo',
    };

    request.user = user;
    return true;
  }
}
