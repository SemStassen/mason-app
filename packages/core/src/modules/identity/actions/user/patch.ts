import { Effect, Option } from "effect";
import type { UserId } from "~/shared/schemas";
import type { User } from "../../domain/user.model";
import { UserNotFoundError } from "../../errors";
import { UserRepository } from "../../repositories/user.repo";

export interface PatchUserInput {
  id: UserId;
  patch: typeof User.patch.Type;
}

export type PatchUserOutput = void;

export const PatchUserAction = Effect.fn("identity/PatchUserAction")(function* (
  input: PatchUserInput
) {
  const userRepo = yield* UserRepository;

  const user = yield* userRepo
    .retrieve({
      query: {
        id: input.id,
      },
    })
    .pipe(Effect.map(Option.getOrThrowWith(() => new UserNotFoundError())));

  const updatedUser = yield* user.patch(input.patch);

  yield* userRepo.update({ users: [updatedUser] });
});
