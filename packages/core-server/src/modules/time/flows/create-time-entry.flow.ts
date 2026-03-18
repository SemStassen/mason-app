import { Authorization } from "@mason/authorization";
import type {
  CreateTimeEntryCommand,
  CreateTimeEntryResult,
} from "@mason/core/contracts";
import { TimeModule } from "@mason/core/modules/time";
import { WorkspaceContext } from "@mason/core/shared/auth";
import { Effect } from "effect";

export const createTimeEntryFlow = Effect.fn("flows.createTimeEntryFlow")(
  function* (request: typeof CreateTimeEntryCommand.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* Authorization;

    const timeModule = yield* TimeModule;

    yield* authz.ensureAllowed({
      action: "time:create_time_entry",
      role: member.role,
    });

    const [createdTimeEntry] = yield* timeModule.createTimeEntries({
      workspaceId: workspace.id,
      workspaceMemberId: member.id,
      data: [request],
    });

    return createdTimeEntry satisfies typeof CreateTimeEntryResult.Type;
  }
);
