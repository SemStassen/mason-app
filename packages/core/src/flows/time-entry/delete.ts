import { AuthorizationService } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { TimeModule } from "~/modules/time";
import { WorkspaceContext } from "~/shared/auth";
import { TimeEntryId } from "~/shared/schemas";

export const DeleteTimeEntryRequest = Schema.Struct({
	timeEntryId: TimeEntryId,
});

export const DeleteTimeEntryResponse = Schema.Void;

export const DeleteTimeEntryFlow = Effect.fn("flows/DeleteTimeEntryFlow")(
	function* (request: typeof DeleteTimeEntryRequest.Type) {
		const { member, workspace } = yield* WorkspaceContext;

		const authz = yield* AuthorizationService;

		const timeModule = yield* TimeModule;

		yield* authz.ensureAllowed({
			action: "time:delete_time_entry",
			role: member.role,
		});

		yield* timeModule.hardDeleteTimeEntry({
			id: request.timeEntryId,
			workspaceId: workspace.id,
		});

		return undefined satisfies typeof DeleteTimeEntryResponse.Type;
	},
);
