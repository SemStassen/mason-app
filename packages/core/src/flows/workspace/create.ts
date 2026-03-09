import { Effect, Option } from "effect";
import { DatabaseService } from "~/infra/db";
import { IdentityModuleService } from "~/modules/identity/identity-module";
import { Workspace } from "~/modules/workspace/domain/workspace.entity";
import { WorkspaceModuleService } from "~/modules/workspace/workspace.layer";
import { WorkspaceMemberModuleService } from "~/modules/workspace-member/workspace-member.service";
import { SessionContext } from "~/shared/auth";

export const CreateWorkspaceRequest = Workspace.jsonCreate;

export const CreateWorkspaceFlow = Effect.fn("flows/CreateWorkspaceFlow")(
  function* (request: typeof CreateWorkspaceRequest.Type) {
    const { user, session } = yield* SessionContext;

    const db = yield* DatabaseService;

    const workspaceModule = yield* WorkspaceModuleService;
    const workspaceMemberModule = yield* WorkspaceMemberModuleService;
    const identityModule = yield* IdentityModuleService;

    yield* db.withTransaction(
      Effect.gen(function* () {
        const createdWorkspace =
          yield* workspaceModule.createWorkspace(request);

        yield* workspaceMemberModule.createWorkspaceMember({
          workspaceId: createdWorkspace.id,
          userId: user.id,
          role: "owner",
          deletedAt: Option.none(),
        });

        yield* identityModule.setActiveWorkspace({
          workspaceId: Option.some(createdWorkspace.id),
          sessionId: session.id,
        });
      })
    );
  }
);
