import { Effect } from "effect";
import { User } from "../../domain/user.model";
import { UserRepository } from "../../repositories/user.repo";

export type CreateUserInput = typeof User.actionCreate.Type;
export type CreateUserOutput = typeof User.entity.Type;

export const CreateUserAction = Effect.fn("identity/CreateUserAction")(
  function* (input: CreateUserInput) {
    const userRepo = yield* UserRepository;

    const createdUser = yield* User.fromInput(input);

    const [persistedUser] = yield* userRepo.insert({ users: [createdUser] });

    return persistedUser;
  }
);
