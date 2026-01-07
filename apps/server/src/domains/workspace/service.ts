import { Context, Effect, Layer, Option } from "effect";
import type { MemberId, WorkspaceId } from "~/shared/schemas";
import {
  WorkspaceDomainError,
  WorkspaceFns,
  WorkspaceNotFoundError,
} from "./internal";
import { WorkspaceRepository } from "./repositories/workspace.repo";
import type {
  CreateWorkspaceCommand,
  UpdateWorkspaceCommand,
} from "./schemas/commands";
import type { Workspace } from "./schemas/workspace.model";

export class WorkspaceDomainService extends Context.Tag(
  "@mason/workspace/WorkspaceDomainService"
)<
  WorkspaceDomainService,
  {
    createWorkspace: (params: {
      command: CreateWorkspaceCommand;
    }) => Effect.Effect<Workspace, WorkspaceDomainError>;
    updateWorkspace: (params: {
      memberId: MemberId;
      command: UpdateWorkspaceCommand;
    }) => Effect.Effect<
      Workspace,
      WorkspaceDomainError | WorkspaceNotFoundError
    >;
    hardDeleteWorkspaces: (params: {
      memberId: MemberId;
      workspaceId: WorkspaceId;
    }) => Effect.Effect<void, WorkspaceDomainError | WorkspaceNotFoundError>;
    retrieveWorkspace: (params: {
      memberId: MemberId;
      workspaceId: WorkspaceId;
    }) => Effect.Effect<
      Option.Option<Workspace>,
      WorkspaceDomainError | WorkspaceNotFoundError
    >;
  }
>() {
  static readonly live = Layer.effect(
    WorkspaceDomainService,
    Effect.gen(function* () {
      const workspaceRepo = yield* WorkspaceRepository;

      return WorkspaceDomainService.of({
        createWorkspace: Effect.fn(
          "workspace/WorkspaceDomainService.createWorkspace"
        )(({ command }) =>
          Effect.gen(function* () {
            const created = yield* WorkspaceFns.create(command);

            const [inserted] = yield* workspaceRepo.insert({
              workspaces: [created],
            });

            return inserted;
          }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new WorkspaceDomainError({ cause: e })),
              ParseError: (e) =>
                Effect.fail(new WorkspaceDomainError({ cause: e })),
            })
          )
        ),
        updateWorkspace: Effect.fn(
          "workspace/WorkspaceDomainService.updateWorkspace"
        )(({ memberId, command }) =>
          Effect.gen(function* () {
            const existing = yield* workspaceRepo
              .retrieve({
                memberId,
                workspaceId: command.workspaceId,
              })
              .pipe(
                Effect.flatMap(
                  Option.match({
                    onNone: () => Effect.fail(new WorkspaceNotFoundError()),
                    onSome: Effect.succeed,
                  })
                )
              );

            const updated = yield* WorkspaceFns.update(existing, command);

            const [result] = yield* workspaceRepo.update({
              memberId,
              workspaces: [updated],
            });

            return result;
          }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new WorkspaceDomainError({ cause: e })),
              ParseError: (e) =>
                Effect.fail(new WorkspaceDomainError({ cause: e })),
            })
          )
        ),
        hardDeleteWorkspaces: Effect.fn(
          "workspace/WorkspaceDomainService.hardDeleteWorkspaces"
        )(({ memberId, workspaceId }) =>
          workspaceRepo
            .hardDelete({
              memberId,
              workspaceIds: [workspaceId],
            })
            .pipe(
              Effect.catchTags({
                "shared/DatabaseError": (e) =>
                  Effect.fail(new WorkspaceDomainError({ cause: e })),
              })
            )
        ),
        retrieveWorkspace: Effect.fn(
          "workspace/WorkspaceDomainService.retrieveWorkspace"
        )(({ memberId, workspaceId }) =>
          workspaceRepo.retrieve({ memberId, workspaceId }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new WorkspaceDomainError({ cause: e })),
            })
          )
        ),
      });
    })
  );
}
