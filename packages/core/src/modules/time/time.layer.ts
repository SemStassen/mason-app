import { DateTime, Effect, Layer, Option } from "effect";
import { TimeEntry } from "./domain/time-entry.entity";
import { TimeEntryAlreadyRunningError } from "./domain/time-entry.errors";
import { updateTimeEntry as applyUpdateTimeEntry } from "./domain/time-entry.transitions";
import { TimeEntryNotFoundError, TimeModule } from "./time.service";
import { TimeEntryRepository } from "./time-entry.repository";

export const TimeModuleLayer = Layer.effect(
	TimeModule,
	Effect.gen(function* () {
		const timeEntryRepo = yield* TimeEntryRepository;

		const ensureNoOtherRunningTimeEntry = (params: {
			workspaceId: TimeEntry["workspaceId"];
			workspaceMemberId: TimeEntry["workspaceMemberId"];
			excludeId?: TimeEntry["id"];
		}) =>
			timeEntryRepo.findRunningByWorkspaceMember(params).pipe(
				Effect.flatMap(
					Option.match({
						onNone: () => Effect.void,
						onSome: () => Effect.fail(new TimeEntryAlreadyRunningError()),
					}),
				),
			);

		return {
			createTimeEntry: Effect.fn("time.createTimeEntry")(function* (params) {
				const now = yield* DateTime.now;

				const timeEntry = TimeEntry.create({
					workspaceId: params.workspaceId,
					workspaceMemberId: params.workspaceMemberId,
					projectId: params.data.projectId,
					taskId: params.data.taskId ?? Option.none(),
					stoppedAt: params.data.stoppedAt ?? Option.none(),
					notes: params.data.notes ?? Option.none(),
					...(Option.isSome(params.data.startedAt)
						? { startedAt: params.data.startedAt.value }
						: {}),
					now,
				});

				if (Option.isNone(timeEntry.stoppedAt)) {
					yield* ensureNoOtherRunningTimeEntry({
						workspaceId: params.workspaceId,
						workspaceMemberId: params.workspaceMemberId,
					});
				}

				const [persistedTimeEntry] = yield* timeEntryRepo.insert([timeEntry]);

				return persistedTimeEntry;
			}),
			updateTimeEntry: Effect.fn("time.updateTimeEntry")(function* (params) {
				const timeEntry = yield* timeEntryRepo
					.findById({ workspaceId: params.workspaceId, id: params.id })
					.pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(
										new TimeEntryNotFoundError({
											timeEntryId: params.id,
										}),
									),
								onSome: Effect.succeed,
							}),
						),
					);

				const updatedTimeEntry = yield* Effect.fromResult(
					applyUpdateTimeEntry({ timeEntry, data: params.data }),
				);

				if (Option.isNone(updatedTimeEntry.stoppedAt)) {
					yield* ensureNoOtherRunningTimeEntry({
						workspaceId: params.workspaceId,
						workspaceMemberId: updatedTimeEntry.workspaceMemberId,
						excludeId: params.id,
					});
				}

				const persistedTimeEntry =
					yield* timeEntryRepo.update(updatedTimeEntry);

				return persistedTimeEntry;
			}),
			hardDeleteTimeEntry: Effect.fn("time.hardDeleteTimeEntry")(
				function* (params) {
					const timeEntry = yield* timeEntryRepo
						.findById({ workspaceId: params.workspaceId, id: params.id })
						.pipe(
							Effect.flatMap(
								Option.match({
									onNone: () =>
										Effect.fail(
											new TimeEntryNotFoundError({
												timeEntryId: params.id,
											}),
										),
									onSome: Effect.succeed,
								}),
							),
						);

					yield* timeEntryRepo.hardDelete({
						workspaceId: params.workspaceId,
						timeEntryIds: [timeEntry.id],
					});
				},
			),
		};
	}),
);
