import { Effect, type Option } from "effect";
import type { UserId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import type { User } from "../../domain/user.model";
import { UserRepository } from "../../repositories/user.repo";

export interface RetrieveUserInput {
  query: AtLeastOne<{
    id: UserId;
    email: User["email"];
  }>;
}
export type RetrieveUserOutput = Option.Option<User>;

export const RetrieveUserAction = Effect.fn("identity/RetrieveUserAction")(
  function* (input: RetrieveUserInput) {
    const userRepo = yield* UserRepository;

    const maybeUser = yield* userRepo.retrieve({ query: input.query });

    return maybeUser;
  }
);
