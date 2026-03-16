import { Authorization } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { TimeModule } from "#modules/time/index";
import { WorkspaceContext } from "#shared/auth/index";
import { TimeEntryId } from "#shared/schemas/index";

export const DeleteTimeEntryRequest = Schema.Struct({
	timeEntryId: TimeEntryId,
});

export const DeleteTimeEntryResponse = Schema.Void;

export const DeleteTimeEntryFlow = Effect.fn("flows/DeleteTimeEntryFlow")(
	function* (request: typeof DeleteTimeEntryRequest.Type) {
		const { member, workspace } = yield* WorkspaceContext;

		const authz = yield* Authorization;

		const timeModule = yield* TimeModule;

		yield* authz.ensureAllowed({
			action: "time:delete_time_entry",
			role: member.role,
		});

		yield* timeModule.hardDeleteTimeEntries({
			workspaceId: workspace.id,
			ids: [request.timeEntryId],
		});

		return undefined satisfies typeof DeleteTimeEntryResponse.Type;
	},
);
