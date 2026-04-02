import type {
  UpdateUserMeCommand,
  UpdateUserMeResult,
} from "@recount/core/contracts";
import { IdentityModule } from "@recount/core/modules/identity";
import { SessionContext } from "@recount/core/shared/auth";
import { Effect } from "effect";

export const updateUserMeFlow = Effect.fn("flows.updateUserMe")(function* (
  params: typeof UpdateUserMeCommand.Type
) {
  const { user } = yield* SessionContext;

  const identityModule = yield* IdentityModule;

  const updatedUser = yield* identityModule.updateUser({
    userId: user.id,
    data: params,
  });

  return updatedUser satisfies typeof UpdateUserMeResult.Type;
});
