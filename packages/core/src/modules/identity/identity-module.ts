import { Context, Effect, Layer } from "effect";
import { MasonError } from "~/shared/errors";
import type {
  SetActiveWorkspaceInput,
  SetActiveWorkspaceOutput,
} from "./actions/session/set-active-workspace";
import { SetActiveWorkspaceAction } from "./actions/session/set-active-workspace";
import type { CreateUserInput, CreateUserOutput } from "./actions/user/create";
import { CreateUserAction } from "./actions/user/create";
import type { PatchUserInput, PatchUserOutput } from "./actions/user/patch";
import { PatchUserAction } from "./actions/user/patch";
import type {
  RetrieveUserInput,
  RetrieveUserOutput,
} from "./actions/user/retrieve";
import { RetrieveUserAction } from "./actions/user/retrieve";
import type { SessionNotFoundError, UserNotFoundError } from "./errors";
import { SessionRepository } from "./repositories/session.repo";
import { UserRepository } from "./repositories/user.repo";

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
