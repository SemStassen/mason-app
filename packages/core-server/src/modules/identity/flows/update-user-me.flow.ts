import type {
  UpdateUserMeCommand,
  UpdateUserMeResult,
} from "@mason/core/contracts";
import { IdentityModule } from "@mason/core/modules/identity";
import { SessionContext } from "@mason/core/shared/auth";
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
