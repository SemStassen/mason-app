import { Effect } from "effect";
import { User } from "../../domain";
import { UserRepository } from "../../repositories";

export type CreateUserInput = typeof User.create.Type;
export type CreateUserOutput = void;

export const CreateUserAction = Effect.fn("identity/CreateUserAction")(
  function* (input: CreateUserInput) {
    const userRepo = yield* UserRepository;

    const createdUser = yield* User.fromInput(input);

    yield* userRepo.insert({ users: [createdUser] });
  }
);
