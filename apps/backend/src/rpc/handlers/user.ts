import { updateUserMeFlow } from "@mason/core-server/modules/identity";
import { UserRpcGroup } from "@mason/core/rpc";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const UserRpcGroupLayer = UserRpcGroup.toLayer(
  Effect.succeed({
    "User.UpdateMe": Effect.fn("rpc.user.updateMe")(
      function* (payload) {
        const user = yield* updateUserMeFlow(payload);

        return user;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  })
);
