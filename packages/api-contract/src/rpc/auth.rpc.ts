import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { WorkspaceId } from "../../../core/types/src";
import { UserResponse } from "../dto/user.dto";
import { WorkspaceResponse } from "../dto/workspace.dto";

export class AuthRpc extends RpcGroup.make(
  Rpc.make("GetSession", {
    success: Schema.Struct({
      session: Schema.Struct({
        id: Schema.NonEmptyString,
        activeWorkspaceId: Schema.NullOr(WorkspaceId),
      }),
      user: Schema.extend(
        UserResponse.pick("id", "displayName", "email", "imageUrl"),
        Schema.Struct({
          memberships: Schema.Array(
            Schema.Struct({
              role: Schema.NonEmptyString,
              workspace: WorkspaceResponse.pick("id", "slug", "name"),
            })
          ),
        })
      ),
    }),
  }),

  Rpc.make("SendEmailVerificationOTP", {
    payload: Schema.Struct({
      email: Schema.NonEmptyString,
      type: Schema.Literal("sign-in", "email-verification", "forget-password"),
    }),
    success: Schema.Void,
  }),

  Rpc.make("SignInWithEmailOTP", {
    payload: Schema.Struct({
      email: Schema.NonEmptyString,
      otp: Schema.String,
    }),
    success: Schema.Void,
  }),

  Rpc.make("SignOut", {
    success: Schema.Void,
  })
) {}
