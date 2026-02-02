import { Context, Effect, Layer } from "effect";
import { MasonError } from "~/shared/errors";
import {
  AcceptWorkspaceInvitationAction,
  type AcceptWorkspaceInvitationInput,
  type AcceptWorkspaceInvitationOutput,
  CancelWorkspaceInvitationAction,
  type CancelWorkspaceInvitationInput,
  type CancelWorkspaceInvitationOutput,
  CreateOrRenewPendingWorkspaceInvitationAction,
  type CreateOrRenewPendingWorkspaceInvitationInput,
  type CreateOrRenewPendingWorkspaceInvitationOutput,
  RejectWorkspaceInvitationAction,
  type RejectWorkspaceInvitationInput,
  type RejectWorkspaceInvitationOutput,
} from "./actions";
import type { WorkspaceInvitationExpiredError } from "./domain";
import { WorkspaceInvitationRepository } from "./repositories";

export class InvitationModuleService extends Context.Tag(
  "@mason/invitation/InvitationModuleService"
)<
  InvitationModuleService,
  {
    createOrRenewPendingWorkspaceInvitation: (
      params: CreateOrRenewPendingWorkspaceInvitationInput
    ) => Effect.Effect<
      CreateOrRenewPendingWorkspaceInvitationOutput,
      WorkspaceInvitationExpiredError | MasonError
    >;
    acceptWorkspaceInvitation: (
      params: AcceptWorkspaceInvitationInput
    ) => Effect.Effect<
      AcceptWorkspaceInvitationOutput,
      WorkspaceInvitationExpiredError | MasonError
    >;
    cancelWorkspaceInvitation: (
      params: CancelWorkspaceInvitationInput
    ) => Effect.Effect<
      CancelWorkspaceInvitationOutput,
      WorkspaceInvitationExpiredError | MasonError
    >;
    rejectWorkspaceInvitation: (
      params: RejectWorkspaceInvitationInput
    ) => Effect.Effect<
      RejectWorkspaceInvitationOutput,
      WorkspaceInvitationExpiredError | MasonError
    >;
  }
>() {
  static readonly live = Layer.effect(
    InvitationModuleService,
    Effect.gen(function* () {
      const workspaceInvitationRepo = yield* WorkspaceInvitationRepository;

      const services = Context.make(
        WorkspaceInvitationRepository,
        workspaceInvitationRepo
      );

      return InvitationModuleService.of({
        createOrRenewPendingWorkspaceInvitation: (params) =>
          CreateOrRenewPendingWorkspaceInvitationAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "invitation/WorkspaceInvitationTransitionError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        acceptWorkspaceInvitation: (params) =>
          AcceptWorkspaceInvitationAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "invitation/WorkspaceInvitationTransitionError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        cancelWorkspaceInvitation: (params) =>
          CancelWorkspaceInvitationAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "invitation/WorkspaceInvitationTransitionError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        rejectWorkspaceInvitation: (params) =>
          RejectWorkspaceInvitationAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "invitation/WorkspaceInvitationTransitionError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),
      });
    })
  );
}
