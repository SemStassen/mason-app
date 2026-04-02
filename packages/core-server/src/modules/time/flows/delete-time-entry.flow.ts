import type {
  DeleteTimeEntryCommand,
  DeleteTimeEntryResult,
} from "@recount/core/contracts";
import { TimeModule } from "@recount/core/modules/time";
import { WorkspaceContext } from "@recount/core/shared/auth";
import { Effect } from "effect";

import { Authorization } from "#shared/authorization/index";

export const deleteTimeEntryFlow = Effect.fn("flows.deleteTimeEntryFlow")(
  function* (request: typeof DeleteTimeEntryCommand.Type) {
    const { workspaceMember, workspace } = yield* WorkspaceContext;

    const authz = yield* Authorization;

    const timeModule = yield* TimeModule;

    yield* authz.ensureAllowed({
      action: "time:delete_time_entry",
      role: workspaceMember.role,
    });

    yield* timeModule.hardDeleteTimeEntries({
      workspaceId: workspace.id,
      ids: [request.timeEntryId],
    });

    return undefined satisfies typeof DeleteTimeEntryResult.Type;
  }
);
