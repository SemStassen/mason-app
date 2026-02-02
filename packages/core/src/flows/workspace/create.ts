import { Effect, Option } from "effect";
import { DatabaseService } from "~/infra/db";
import { IdentityModuleService } from "~/modules/identity/identity-module";
import { MemberModuleService } from "~/modules/member/member-module.service";
import { Workspace } from "~/modules/workspace/domain/workspace.model";
import { WorkspaceModuleService } from "~/modules/workspace/workspace-module.service";
import { SessionContext } from "~/shared/auth";

export const CreateWorkspaceRequest = Workspace.createInput;

export const CreateWorkspaceFlow = Effect.fn("flows/CreateWorkspaceFlow")(
  function* (request: typeof CreateWorkspaceRequest.Type) {
    const { user, session } = yield* SessionContext;

    const db = yield* DatabaseService;

    const workspaceModule = yield* WorkspaceModuleService;
    const memberModule = yield* MemberModuleService;
    const identityModule = yield* IdentityModuleService;

    yield* db.withTransaction(
      Effect.gen(function* () {
        const createdWorkspace =
          yield* workspaceModule.createWorkspace(request);

        yield* memberModule.createMember({
          workspaceId: createdWorkspace.id,
          userId: user.id,
          role: "owner",
        });

        yield* identityModule.setActiveWorkspace({
          workspaceId: Option.some(createdWorkspace.id),
          sessionId: session.id,
        });
      })
    );
  }
);
