import type {
  CheckWorkspaceSlugIsUniqueCommand,
  CheckWorkspaceSlugIsUniqueResult,
} from "@recount/core/contracts";
import { WorkspaceModule } from "@recount/core/modules/workspace";
import { Effect } from "effect";

export const checkWorkspaceSlugIsUniqueFlow = Effect.fn(
  "flows.checkWorkspaceSlugIsUniqueFlow"
)(function* (params: typeof CheckWorkspaceSlugIsUniqueCommand.Type) {
  const workspaceModule = yield* WorkspaceModule;

  const isUnique = yield* workspaceModule.checkWorkspaceSlugAvailability(
    params.slug
  );

  return {
    isUnique,
  } satisfies typeof CheckWorkspaceSlugIsUniqueResult.Type;
});
