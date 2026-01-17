import { Effect } from "effect";
import { type CreateUser, User } from "../../domain";
import { UserRepository } from "../../repositories";

export type CreateUserInput = CreateUser;
export type CreateUserOutput = void;

export const CreateUserAction = Effect.fn("identity/CreateUserAction")(
  function* (input: CreateUserInput) {
    const userRepo = yield* UserRepository;

    const createdUser = yield* User.create(input);

    yield* userRepo.insert({ users: [createdUser] });
  }
);
