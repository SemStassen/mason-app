import { Effect, Schema } from "effect";
import { Workspace } from "~/modules/workspace/domain/workspace.entity";
import { WorkspaceModule } from "~/modules/workspace/workspace.service";

export const CheckWorkspaceSlugIsUniqueRequest = Schema.Struct({
	slug: Workspace.fields.slug,
});

export const CheckWorkspaceSlugIsUniqueResponse = Schema.Struct({
	isUnique: Schema.Boolean,
});

export const CheckWorkspaceSlugIsUniqueFlow = Effect.fn(
	"flows/CheckWorkspaceSlugIsUniqueFlow",
)(function* (params: typeof CheckWorkspaceSlugIsUniqueRequest.Type) {
	const workspaceModule = yield* WorkspaceModule;

	const isUnique = yield* workspaceModule.checkWorkspaceSlugAvailability(
		params.slug,
	);

	return {
		isUnique,
	} satisfies typeof CheckWorkspaceSlugIsUniqueResponse.Type;
});
