import { Authorization } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { TimeEntry, TimeModule } from "#modules/time/index";
import { WorkspaceContext } from "#shared/auth/index";
import { TimeEntryId } from "#shared/schemas/index";

export const UpdateTimeEntryRequest = Schema.Struct({
  timeEntryId: TimeEntryId,
  data: TimeEntry.jsonUpdate,
});

export const UpdateTimeEntryResponse = TimeEntry.json;

export const updateTimeEntryFlow = Effect.fn("flows.updateTimeEntryFlow")(
  function* (request: typeof UpdateTimeEntryRequest.Type) {
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

    return updatedTimeEntry satisfies typeof UpdateTimeEntryResponse.Type;
  }
);
