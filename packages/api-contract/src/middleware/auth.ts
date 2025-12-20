import {
  HttpApiError,
  HttpApiMiddleware,
  HttpApiSecurity,
} from "@effect/platform";
import { Context, Schema } from "effect";

// These are copied from core/src/models/shared.ts
// because we don't want to depend on the core package in the api-contract package
const UserId = Schema.NonEmptyString.pipe(Schema.brand("UserId"));

export class AuthData extends Schema.Class<AuthData>(
  "@mason/api-contract/authData"
)({
  userId: UserId,
}) {}

export class AuthContext extends Context.Tag(
  "@mason/api-contract/authContext"
)<AuthContext, AuthData>() {}

export class AuthMiddleware extends HttpApiMiddleware.Tag<AuthMiddleware>()(
  "@mason/api-contract/authMiddleware",
  {
    failure: HttpApiError.Unauthorized,
    provides: AuthContext,
    security: {
      bearer: HttpApiSecurity.bearer,
    },
    optional: false,
  }
) {}
