import { HttpApiError, HttpApiMiddleware } from '@effect/platform';
import { Context, Schema } from 'effect';
import { User } from '~/models/user.model';
import { Workspace } from '~/models/workspace.model';

class RequestContextProvides extends Schema.Struct({
  user: User.pick('id'),
  workspace: Workspace.pick('id'),
}) {}

class RequestContext extends Context.Tag('RequestContext')<
  RequestContext,
  RequestContextProvides
>() {}

class AuthorizationMiddleware extends HttpApiMiddleware.Tag<AuthorizationMiddleware>()(
  'AuthorizationMiddleware',
  {
    failure: HttpApiError.Unauthorized,
    provides: RequestContext,
  }
) {}
