import { AuthRpcGroup } from "@mason/core/rpc";
import { SessionContext } from "@mason/core/shared/auth";
import { Effect } from "effect";

export const AuthRpcGroupLayer = AuthRpcGroup.toLayer(
  Effect.succeed({
    "Auth.GetSession": () =>
      Effect.gen(function* () {
        const sessionContext = yield* SessionContext;

        return sessionContext;
      }),
  })
);
