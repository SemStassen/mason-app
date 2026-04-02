import type {
  CreateWorkspaceCommand,
  CreateWorkspaceResult,
} from "@recount/core/contracts";
import { IdentityModule } from "@recount/core/modules/identity";
import { WorkspaceModule } from "@recount/core/modules/workspace";
import { WorkspaceMemberModule } from "@recount/core/modules/workspace-member";
import { SessionContext } from "@recount/core/shared/auth";
import { Database } from "@recount/db";
import { Effect, Option } from "effect";

export const createWorkspaceFlow = Effect.fn("flows.createWorkspaceFlow")(
  function* (request: typeof CreateWorkspaceCommand.Type) {
    const { user, session } = yield* SessionContext;

    const db = yield* Database;

    const workspaceModule = yield* WorkspaceModule;
    const workspaceMemberModule = yield* WorkspaceMemberModule;
    const identityModule = yield* IdentityModule;

    const createdWorkspace = yield* db.withTransaction(
      Effect.gen(function* () {
        const workspace = yield* workspaceModule.createWorkspace(request);

        yield* workspaceMemberModule
          .createWorkspaceMember({
            workspaceId: workspace.id,
            userId: user.id,
            role: "owner",
            data: {
              displayName: user.fullName,
            },
          })
          .pipe(
            Effect.catchTags({
              "workspace-member/WorkspaceMemberAlreadyExistsError": () =>
                Effect.die(
                  "invariant violated: user is already a member of the workspace"
                ),
            })
          );

        yield* identityModule.setLastActiveWorkspace({
          workspaceId: Option.some(workspace.id),
          sessionId: session.id,
        });

        return workspace;
      })
    );

    return createdWorkspace satisfies typeof CreateWorkspaceResult.Type;
  }
);
