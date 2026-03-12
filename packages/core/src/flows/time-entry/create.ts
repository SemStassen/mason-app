import { Authorization } from "@mason/authorization";
import { Effect } from "effect";
import { TimeEntry, TimeModule } from "~/modules/time";
import { WorkspaceContext } from "~/shared/auth";

export const CreateTimeEntryRequest = TimeEntry.jsonCreate;

export const CreateTimeEntryResponse = TimeEntry.json;

export const CreateTimeEntryFlow = Effect.fn("flows/CreateTimeEntryFlow")(
	function* (request: typeof CreateTimeEntryRequest.Type) {
		const { member, workspace } = yield* WorkspaceContext;

		const authz = yield* Authorization;

		const timeModule = yield* TimeModule;

		yield* authz.ensureAllowed({
			action: "time:create_time_entry",
			role: member.role,
		});

		const createdTimeEntry = yield* timeModule.createTimeEntry({
			workspaceId: workspace.id,
			workspaceMemberId: member.id,
			data: request,
		});

		return createdTimeEntry satisfies typeof CreateTimeEntryResponse.Type;
	},
);
