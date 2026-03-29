import type {
  CreateTimeEntryCommand,
  CreateTimeEntryResult,
} from "@mason/core/contracts";
import { TimeModule } from "@mason/core/modules/time";
import { WorkspaceContext } from "@mason/core/shared/auth";
import { Effect } from "effect";

import { Authorization } from "#shared/authorization/index";

export const createTimeEntryFlow = Effect.fn("flows.createTimeEntryFlow")(
  function* (request: typeof CreateTimeEntryCommand.Type) {
    const { workspaceMember, workspace } = yield* WorkspaceContext;

    const authz = yield* Authorization;

    const timeModule = yield* TimeModule;

    yield* authz.ensureAllowed({
      action: "time:create_time_entry",
      role: workspaceMember.role,
    });

    const [createdTimeEntry] = yield* timeModule.createTimeEntries({
      workspaceId: workspace.id,
      workspaceMemberId: workspaceMember.id,
      data: [request],
    });

    return createdTimeEntry satisfies typeof CreateTimeEntryResult.Type;
  }
);
