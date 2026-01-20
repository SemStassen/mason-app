import { Effect, Option } from "effect";
import { DatabaseService } from "~/infra/db";
import { IdentityActionsService } from "~/modules/identity";
import { MemberActionsService } from "~/modules/member";
import { Workspace, WorkspaceActionsService } from "~/modules/workspace";
import { SessionContext } from "~/shared/auth";

export const CreateWorkspaceRequest = Workspace.createInput;

export const CreateWorkspaceFlow = Effect.fn("flows/CreateWorkspaceFlow")(
  function* (request: typeof CreateWorkspaceRequest.Type) {
    const { user, session } = yield* SessionContext;

    const db = yield* DatabaseService;

    const workspaceActions = yield* WorkspaceActionsService;
    const memberActions = yield* MemberActionsService;
    const identityActions = yield* IdentityActionsService;

    yield* db.withTransaction(
      Effect.gen(function* () {
        const createdWorkspace =
          yield* workspaceActions.createWorkspace(request);

        yield* memberActions.createMember({
          workspaceId: createdWorkspace.id,
          userId: user.id,
          role: "owner",
        });

        yield* identityActions.setActiveWorkspace({
          workspaceId: Option.some(createdWorkspace.id),
          sessionId: session.id,
        });
      })
    );
  }
);
