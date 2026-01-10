import { Context, Effect, Layer, type Option } from "effect";
import type { WorkspaceId } from "~/shared/schemas";
import { WorkspaceDomainError, WorkspaceFns } from "./internal";
import { WorkspaceRepository } from "./repositories/workspace.repo";
import type {
  CreateWorkspaceCommand,
  PatchWorkspaceCommand,
} from "./schemas/commands";
import type { Workspace } from "./schemas/workspace.model";

export class WorkspaceDomainService extends Context.Tag(
  "@mason/workspace/WorkspaceDomainService"
)<
  WorkspaceDomainService,
  {
    makeWorkspace: (params: {
      command: CreateWorkspaceCommand;
    }) => Effect.Effect<Workspace, WorkspaceDomainError>;
    patchWorkspace: (params: {
      existing: Workspace;
      command: PatchWorkspaceCommand;
    }) => Effect.Effect<Workspace, WorkspaceDomainError>;
    saveWorkspace: (params: {
      existing: Workspace;
    }) => Effect.Effect<void, WorkspaceDomainError>;
    retrieveWorkspace: (params: {
      workspaceId: WorkspaceId;
    }) => Effect.Effect<Option.Option<Workspace>, WorkspaceDomainError>;
    hardDeleteWorkspace: (params: {
      existing: Workspace;
    }) => Effect.Effect<void, WorkspaceDomainError>;
  }
>() {
  static readonly live = Layer.effect(
    WorkspaceDomainService,
    Effect.gen(function* () {
      const workspaceRepo = yield* WorkspaceRepository;

      return WorkspaceDomainService.of({
        makeWorkspace: ({ command }) => WorkspaceFns.create(command),

        patchWorkspace: ({ existing, command }) =>
          WorkspaceFns.patch(existing, command),

        saveWorkspace: Effect.fn(
          "workspace/WorkspaceDomainService.saveWorkspace"
        )(
          function* ({ existing }) {
            yield* workspaceRepo.upsert({ workspaces: [existing] });
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new WorkspaceDomainError({ cause: e })),
          })
        ),

        retrieveWorkspace: Effect.fn(
          "workspace/WorkspaceDomainService.retrieveWorkspace"
        )(
          function* ({ workspaceId }) {
            return yield* workspaceRepo.retrieve({ workspaceId });
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new WorkspaceDomainError({ cause: e })),
          })
        ),

        hardDeleteWorkspace: Effect.fn(
          "workspace/WorkspaceDomainService.hardDeleteWorkspace"
        )(
          function* ({ existing }) {
            yield* workspaceRepo.hardDelete({
              workspaceIds: [existing.id],
            });
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new WorkspaceDomainError({ cause: e })),
          })
        ),
      });
    })
  );
}
