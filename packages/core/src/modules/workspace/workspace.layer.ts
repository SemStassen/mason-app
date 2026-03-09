import { Effect, Layer, Option } from "effect";
import { WorkspaceId } from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import { Workspace } from "./domain/workspace.entity";
import { WorkspaceRepository } from "./domain/workspace.repository";
import {
	WorkspaceModule,
	WorkspaceNotFoundError,
	WorkspaceSlugAlreadyExistsError,
} from "./workspace.service";

export const WorkspaceModuleLayer = Layer.effect(
	WorkspaceModule,
	Effect.gen(function* () {
		const workspaceRepo = yield* WorkspaceRepository;

		const assertWorkspaceSlugIsUnique = Effect.fn(
			"workspace.assertWorkspaceSlugIsUnique",
		)(function* (slug: string) {
			const maybeWorkspace = yield* workspaceRepo.findBySlug(slug);

			if (Option.isSome(maybeWorkspace)) {
				return yield* new WorkspaceSlugAlreadyExistsError();
			}
		});

		return {
			createWorkspace: Effect.fn("workspace.createWorkspace")(function* (data) {
				yield* assertWorkspaceSlugIsUnique(data.slug);

				const workspace = Workspace.make({
					...data,
					id: WorkspaceId.makeUnsafe(generateUUID()),
					logoUrl: data.logoUrl ?? Option.none(),
					metadata: data.metadata ?? Option.none(),
				});

				const [persistedWorkspace] = yield* workspaceRepo.insert([workspace]);

				return persistedWorkspace;
			}),
			updateWorkspace: Effect.fn("workspace.updateWorkspace")(
				function* (params) {
					const workspace = yield* workspaceRepo.findById(params.id).pipe(
						Effect.flatMap(
							Option.match({
								onNone: () => Effect.fail(new WorkspaceNotFoundError()),
								onSome: Effect.succeed,
							}),
						),
					);

					if (params.data.slug) {
						yield* assertWorkspaceSlugIsUnique(params.data.slug);
					}

					const updatedWorkspace = Workspace.make({
						...workspace,
						...params.data,
					});

					const persistedWorkspace =
						yield* workspaceRepo.update(updatedWorkspace);

					return persistedWorkspace;
				},
			),
			checkWorkspaceSlugAvailability: Effect.fn(
				"workspace.checkWorkspaceSlugAvailability",
			)(function* (slug) {
				const maybeWorkspace = yield* workspaceRepo.findBySlug(slug);

				return Option.isNone(maybeWorkspace);
			}),
		};
	}),
);
