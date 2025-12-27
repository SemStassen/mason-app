import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";

export class OAuthRpc extends RpcGroup.make(
  Rpc.make("SignInWithGoogle", {
    payload: Schema.Struct({
      platform: Schema.Literal("web", "desktop"),
    }),
    success: Schema.Struct({
      url: Schema.String,
    }),
  }),

  Rpc.make("GoogleCallback", {
    success: Schema.Void,
  })
) {}
