import type {
  ListWorkspacesCommand,
  ListWorkspacesResult,
} from "@mason/core/contracts";
import { WorkspaceModule } from "@mason/core/modules/workspace";
import { WorkspaceMemberModule } from "@mason/core/modules/workspace-member";
import { SessionContext } from "@mason/core/shared/auth";
import { Effect } from "effect";

export const listWorkspacesFlow = Effect.fn("flows.listWorkspacesFlow")(
  function* (_request: typeof ListWorkspacesCommand.Type) {
    const { user } = yield* SessionContext;

    const workspaceMemberModule = yield* WorkspaceMemberModule;
    const workspaceModule = yield* WorkspaceModule;

    const userWorkspaceMemberships = yield* workspaceMemberModule.listByUserId(
      user.id
    );

    const workspaces = yield* workspaceModule.listWorkspacesByIds(
      userWorkspaceMemberships.map((m) => m.workspaceId)
    );

    return workspaces satisfies typeof ListWorkspacesResult.Type;
  }
);
