import {
  HttpApiError,
  HttpApiMiddleware,
  HttpApiSecurity,
} from "@effect/platform";
import { Context, Schema } from "effect";

// These are copied from core/src/models/shared.ts
// because we don't want to depend on the core package in the api-contract package
const UserId = Schema.NonEmptyString.pipe(Schema.brand("UserId"));
const MemberId = Schema.NonEmptyString.pipe(Schema.brand("MemberId"));
const WorkspaceId = Schema.NonEmptyString.pipe(Schema.brand("WorkspaceId"));

export class SessionData extends Schema.Class<SessionData>(
  "@mason/api-contract/sessionData"
)({
  userId: UserId,
  memberId: MemberId,
  workspaceId: WorkspaceId,
}) {}

export class SessionContext extends Context.Tag(
  "@mason/api-contract/sessionContext"
)<SessionContext, SessionData>() {}

export class SessionMiddleware extends HttpApiMiddleware.Tag<SessionMiddleware>()(
  "@mason/api-contract/sessionMiddleware",
  {
    failure: HttpApiError.Unauthorized,
    provides: SessionContext,
    optional: false,
  }
) {}
