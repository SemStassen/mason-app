import {
  HttpApiError,
  HttpApiMiddleware,
  HttpApiSecurity,
} from "@effect/platform";
import { Context, Schema } from "effect";

// These are copied from core/src/models/shared.ts
// because we don't want to depend on the core package in the api-contract package
const UserId = Schema.NonEmptyString.pipe(Schema.brand("UserId"));
const WorkspaceId = Schema.NonEmptyString.pipe(Schema.brand("WorkspaceId"));

export class RequestContextData extends Schema.Class<RequestContextData>(
  "@mason/api-contract/requestContextData"
)({
  userId: UserId,
  workspaceId: WorkspaceId,
}) {}

export class RequestContext extends Context.Tag(
  "@mason/api-contract/requestContext"
)<RequestContext, RequestContextData>() {}

export class AuthMiddleware extends HttpApiMiddleware.Tag<AuthMiddleware>()(
  "@mason/api-contract/authMiddleware",
  {
    failure: HttpApiError.Unauthorized,
    provides: RequestContext,
    security: {
      bearer: HttpApiSecurity.bearer,
    },
    optional: false,
  }
) {}
