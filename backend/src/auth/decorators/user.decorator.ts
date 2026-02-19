import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../database/models/user.model';

export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
