import type {
  UpdateTimeEntryCommand,
  UpdateTimeEntryResult,
} from "@mason/core/contracts";
import { TimeModule } from "@mason/core/modules/time";
import { WorkspaceContext } from "@mason/core/shared/auth";
import { Effect } from "effect";
import { Authorization } from "#shared/authorization/index";

export const updateTimeEntryFlow = Effect.fn("flows.updateTimeEntryFlow")(
  function* (request: typeof UpdateTimeEntryCommand.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* Authorization;

    const timeModule = yield* TimeModule;

    yield* authz.ensureAllowed({
      action: "time:update_time_entry",
      role: member.role,
    });

    const updatedTimeEntry = yield* timeModule.updateTimeEntry({
      id: request.timeEntryId,
      workspaceId: workspace.id,
      data: request.data,
    });

    return updatedTimeEntry satisfies typeof UpdateTimeEntryResult.Type;
  }
);
