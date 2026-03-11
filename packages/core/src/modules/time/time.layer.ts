import { Effect, Layer, Option } from "effect";
import { TimeEntry } from "./domain/time-entry.entity";
import { TimeEntryNotFoundError, TimeModule } from "./time.service";
import { TimeEntryRepository } from "./time-entry.repository";

export const TimeModuleLayer = Layer.effect(
	TimeModule,
	Effect.gen(function* () {
		const timeEntryRepo = yield* TimeEntryRepository;

		return {
			createTimeEntry: Effect.fn("time.createTimeEntry")(function* (params) {
				const timeEntry = TimeEntry.create({
					...params.data,
					workspaceId: params.workspaceId,
					workspaceMemberId: params.workspaceMemberId,
				});

				const [persistedTimeEntry] = yield* timeEntryRepo.insert([timeEntry]);

				return persistedTimeEntry;
			}),
			updateTimeEntry: Effect.fn("time.updateTimeEntry")(function* (params) {
				const timeEntry = yield* timeEntryRepo.findById(params.id);

				const updatedTimeEntry = TimeEntry.make({
					...timeEntry,
					...params.data,
				});

				const persistedTimeEntry =
					yield* timeEntryRepo.update(updatedTimeEntry);

				return persistedTimeEntry;
			}),
			hardDeleteTimeEntry: Effect.fn("time.hardDeleteTimeEntry")(
				function* (params) {
					const timeEntry = yield* timeEntryRepo.findById(params.id).pipe(
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
