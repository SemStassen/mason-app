import { Context, Effect, Layer } from "effect";
import { MasonError } from "~/shared/errors";
import {
  CreateUserAction,
  type CreateUserInput,
  type CreateUserOutput,
  PatchUserAction,
  type PatchUserInput,
  type PatchUserOutput,
  RetrieveUserAction,
  type RetrieveUserInput,
  type RetrieveUserOutput,
  SetActiveWorkspaceAction,
  type SetActiveWorkspaceInput,
  type SetActiveWorkspaceOutput,
} from "./actions";
import type { SessionNotFoundError, UserNotFoundError } from "./errors";
import { SessionRepository, UserRepository } from "./repositories";

export class IdentityModuleService extends Context.Tag(
  "@mason/identity/IdentityModuleService"
)<
  IdentityModuleService,
  {
    setActiveWorkspace: (
      params: SetActiveWorkspaceInput
    ) => Effect.Effect<
      SetActiveWorkspaceOutput,
      SessionNotFoundError | MasonError
    >;
    createUser: (
      params: CreateUserInput
    ) => Effect.Effect<CreateUserOutput, MasonError>;
    patchUser: (
      params: PatchUserInput
    ) => Effect.Effect<PatchUserOutput, UserNotFoundError | MasonError>;
    retrieveUser: (
      params: RetrieveUserInput
    ) => Effect.Effect<RetrieveUserOutput, MasonError>;
  }
>() {
  static readonly live = Layer.effect(
    IdentityModuleService,
    Effect.gen(function* () {
      const sessionRepo = yield* SessionRepository;
      const userRepo = yield* UserRepository;

      const services = Context.make(SessionRepository, sessionRepo).pipe(
        Context.add(UserRepository, userRepo)
      );

      return IdentityModuleService.of({
        setActiveWorkspace: (params) =>
          SetActiveWorkspaceAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
            })
          ),
        createUser: (params) =>
          CreateUserAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
            })
          ),
        patchUser: (params) =>
          PatchUserAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
            })
          ),
        retrieveUser: (params) =>
          RetrieveUserAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),
      });
    })
  );
}
