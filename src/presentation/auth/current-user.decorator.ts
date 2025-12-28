import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserPayload } from './fake-auth.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserPayload | undefined => {
    const request = context.switchToHttp().getRequest();
    return request.user as CurrentUserPayload | undefined;
  },
);
