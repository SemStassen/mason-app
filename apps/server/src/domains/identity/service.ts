import { Context, Effect, Layer, Option } from "effect";
import type { ParseError } from "effect/ParseResult";
import { AuthorizationService } from "~/application/authorization";
import type { AuthorizationError } from "~/shared/errors/authorization";
import type { UserId } from "~/shared/schemas";
import { IdentityDomainError, UserFns, UserNotFoundError } from "./internal";
import { UserRepository } from "./repositories/user.repo";
import type {
  CreateUserCommand,
  MarkUserEmailAsVerifiedCommand,
  UpdateUserCommand,
  UpdateUserEmailCommand,
} from "./schemas/commands";
import type { User } from "./schemas/user.model";

export class IdentityDomainService extends Context.Tag(
  "@mason/identity/IdentityDomainService"
)<
  IdentityDomainService,
  {
    createUser: (params: {
      command: CreateUserCommand;
    }) => Effect.Effect<User, IdentityDomainError>;
    updateUser: (params: {
      currentUserId: UserId;
      command: UpdateUserCommand;
    }) => Effect.Effect<
      User,
      AuthorizationError | UserNotFoundError | IdentityDomainError
    >;
    updateUserEmail: (params: {
      currentUserId: UserId;
      command: UpdateUserEmailCommand;
    }) => Effect.Effect<
      User,
      AuthorizationError | UserNotFoundError | IdentityDomainError
    >;
    markUserEmailAsVerified: (params: {
      currentUserId: UserId;
      command: MarkUserEmailAsVerifiedCommand;
    }) => Effect.Effect<
      User,
      AuthorizationError | UserNotFoundError | IdentityDomainError
    >;
    retrieveUser: (params: {
      currentuserId: UserId;
    }) => Effect.Effect<User, UserNotFoundError | IdentityDomainError>;
  }
>() {
  static readonly live = Layer.effect(
    IdentityDomainService,
    Effect.gen(function* () {
      const authorization = yield* AuthorizationService;
      const userRepo = yield* UserRepository;

      return IdentityDomainService.of({
        createUser: Effect.fn("identity/IdentityDomainService.createUser")(
          function* ({ command }) {
            const created = yield* UserFns.create(command);

            const [inserted] = yield* userRepo.insert({
              users: [created],
            });

            return inserted;
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new IdentityDomainError({ cause: e })),
            ParseError: (e: ParseError) =>
              Effect.fail(new IdentityDomainError({ cause: e })),
          })
        ),
        updateUser: Effect.fn("identity/IdentityDomainService.updateUser")(
          function* ({ currentUserId, command }) {
            const existing = yield* userRepo
              .retrieve({ userId: command.userId })
              .pipe(
                Effect.flatMap(
                  Option.match({
                    onNone: () => Effect.fail(new UserNotFoundError()),
                    onSome: Effect.succeed,
                  })
                )
              );

            yield* authorization.ensureUserMatches({
              userId: currentUserId,
              model: [{ userId: existing.id }],
            });

            const updated = yield* UserFns.update(existing, command);

            const [result] = yield* userRepo.update({
              users: [updated],
            });

            return result;
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new IdentityDomainError({ cause: e })),
            ParseError: (e: ParseError) =>
              Effect.fail(new IdentityDomainError({ cause: e })),
          })
        ),
        updateUserEmail: Effect.fn(
          "identity/IdentityDomainService.updateUserEmail"
        )(
          function* ({ currentUserId, command }) {
            const existing = yield* userRepo
              .retrieve({ userId: command.userId })
              .pipe(
                Effect.flatMap(
                  Option.match({
                    onNone: () => Effect.fail(new UserNotFoundError()),
                    onSome: Effect.succeed,
                  })
                )
              );

            yield* authorization.ensureUserMatches({
              userId: currentUserId,
              model: [{ userId: existing.id }],
            });

            const updated = yield* UserFns.updateEmail(existing, command.email);

            const [result] = yield* userRepo.update({
              users: [updated],
            });

            return result;
          },

          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new IdentityDomainError({ cause: e })),
            ParseError: (e: ParseError) =>
              Effect.fail(new IdentityDomainError({ cause: e })),
          })
        ),
        markUserEmailAsVerified: Effect.fn(
          "identity/IdentityDomainService.markUserEmailAsVerified"
        )(
          function* ({ currentUserId, command }) {
            const existing = yield* userRepo
              .retrieve({ userId: command.userId })
              .pipe(
                Effect.flatMap(
                  Option.match({
                    onNone: () => Effect.fail(new UserNotFoundError()),
                    onSome: Effect.succeed,
                  })
                )
              );

            yield* authorization.ensureUserMatches({
              userId: currentUserId,
              model: [{ userId: existing.id }],
            });

            const updated = yield* UserFns.markEmailAsVerified(existing);
            const [result] = yield* userRepo.update({
              users: [updated],
            });
            return result;
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new IdentityDomainError({ cause: e })),
            ParseError: (e: ParseError) =>
              Effect.fail(new IdentityDomainError({ cause: e })),
          })
        ),
        retrieveUser: Effect.fn("identity/IdentityDomainService.retrieveUser")(
          function* ({ currentuserId }) {
            const existing = yield* userRepo
              .retrieve({ userId: currentuserId })
              .pipe(
                Effect.flatMap(
                  Option.match({
                    onNone: () => Effect.fail(new UserNotFoundError()),
                    onSome: Effect.succeed,
                  })
                )
              );

            return existing;
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
