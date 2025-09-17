import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { UserResponse } from "~/models/user.model";
import { WorkspaceResponse } from "~/models/workspace.model";
import { regex } from "~/utils/regex";

export const AuthGroup = HttpApiGroup.make("Auth")
  .add(
    HttpApiEndpoint.get("GetSession")`/session`
      .addSuccess(
        Schema.Struct({
          user: Schema.extend(
            UserResponse.pick(
              "id",
              "displayName",
              "email",
              "emailVerified",
              "imageUrl"
            ),
            Schema.Struct({
              workspaces: Schema.Array(
                WorkspaceResponse.pick("id", "slug", "name")
              ),
              activeWorkspace: Schema.NullOr(
                WorkspaceResponse.pick("id", "slug", "name")
              ),
            })
          ),
        })
      )
      .addError(HttpApiError.InternalServerError)
      .addError(HttpApiError.Unauthorized)
  )
  .add(
    HttpApiEndpoint.post("SendEmailVerificationOTP")`/email-otp`
      .setPayload(
        Schema.Struct({
          email: Schema.String.pipe(Schema.pattern(regex.email)),
          type: Schema.Literal(
            "sign-in",
            "email-verification",
            "forget-password"
          ),
        })
      )
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post("SignInWithEmailOTP")`/verify-email`
      .setPayload(
        Schema.Struct({
          email: Schema.String.pipe(Schema.pattern(regex.email)),
          otp: Schema.String,
        })
      )
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post("SignOut")`/sign-out`.addError(
      HttpApiError.InternalServerError
    )
  );
