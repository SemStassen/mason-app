import { Effect, Schema } from "effect";
import { Workspace, WorkspaceModuleService } from "~/modules/workspace";

export const CheckWorkspaceSlugIsUniqueRequest = Schema.Struct({
  slug: Workspace.fields.slug,
});

export const CheckWorkspaceSlugIsUniqueResponse = Schema.Struct({
  isUnique: Schema.Boolean,
});

export const CheckWorkspaceSlugIsUniqueFlow = Effect.fn(
  "flows/CheckWorkspaceSlugIsUniqueFlow"
)(function* (params: typeof CheckWorkspaceSlugIsUniqueRequest.Type) {
  const workspaceModule = yield* WorkspaceModuleService;

  const isUnique = yield* workspaceModule
    .assertWorkspaceSlugUnique({ slug: params.slug })
    .pipe(
      Effect.as(true),
      Effect.catchTag("workspace/WorkspaceSlugAlreadyExistsError", () =>
        Effect.succeed(false)
      )
    );

  return {
    isUnique,
  } satisfies typeof CheckWorkspaceSlugIsUniqueResponse.Type;
});
