import { setLastActiveWorkspaceFlow } from "@recount/core-server/modules/identity";
import { AuthRpcGroup } from "@recount/core/rpc";
import { SessionContext } from "@recount/core/shared/auth";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const AuthRpcGroupLayer = AuthRpcGroup.toLayer(
  Effect.succeed({
    "Auth.GetSession": () =>
      Effect.gen(function* () {
        const sessionContext = yield* SessionContext;

        return sessionContext;
      }),
    "Auth.SetLastActiveWorkspace": (payload) =>
      Effect.gen(function* () {
        const workspace = yield* setLastActiveWorkspaceFlow(payload);

        return workspace;
      }).pipe(
        Effect.catchTags({
          RepositoryError: () =>
            Effect.fail(new HttpApiError.InternalServerError()),
        })
      ),
  })
);
