import { Context, Effect, Layer, type Option } from "effect";
import type { Email } from "~/shared/schemas";
import type { UserId } from "~/shared/schemas/ids";
import { IdentityDomainError, UserFns } from "./internal";
import { UserRepository } from "./repositories/user.repo";
import type {
  CreateUserCommand,
  PatchUserCommand,
  UpdateUserEmailCommand,
} from "./schemas/commands";
import type { User } from "./schemas/user.model";

export class IdentityDomainService extends Context.Tag(
  "@mason/identity/IdentityDomainService"
)<
  IdentityDomainService,
  {
    makeUser: (params: {
      command: CreateUserCommand;
    }) => Effect.Effect<User, IdentityDomainError>;
    patchUser: (params: {
      existing: User;
      command: PatchUserCommand;
    }) => Effect.Effect<User, IdentityDomainError>;
    updateUserEmail: (params: {
      existing: User;
      command: UpdateUserEmailCommand;
    }) => Effect.Effect<User, IdentityDomainError>;
    markUserEmailAsVerified: (params: {
      existing: User;
    }) => Effect.Effect<User, IdentityDomainError>;
    saveUser: (params: {
      existing: User;
    }) => Effect.Effect<void, IdentityDomainError>;
    retrieveUser: (params: {
      query: {
        userId?: UserId;
        email?: Email;
      };
    }) => Effect.Effect<Option.Option<User>, IdentityDomainError>;
  }
>() {
  static readonly live = Layer.effect(
    IdentityDomainService,
    Effect.gen(function* () {
      const userRepo = yield* UserRepository;

      return IdentityDomainService.of({
        makeUser: ({ command }) => UserFns.create(command),

        patchUser: ({ existing, command }) => UserFns.patch(existing, command),

        updateUserEmail: ({ existing, command }) =>
          UserFns.updateEmail(existing, command),

        markUserEmailAsVerified: ({ existing }) =>
          UserFns.markEmailAsVerified(existing),

        saveUser: Effect.fn("identity/IdentityDomainService.saveUser")(
          function* ({ existing }) {
            yield* userRepo.update({
              users: [existing],
            });
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new IdentityDomainError({ cause: e })),
          })
        ),

        retrieveUser: Effect.fn("identity/IdentityDomainService.retrieveUser")(
          function* ({ query }) {
            return yield* userRepo.retrieve({ query });
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new IdentityDomainError({ cause: e })),
          })
        ),
      });
    })
  );
}
