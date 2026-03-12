import { DateTime, Effect, Layer, Option } from "effect";
import type { TimeEntry } from "./domain/time-entry.entity";
import { TimeEntryAlreadyRunningError } from "./domain/time-entry.errors";

import * as timeEntryTransitions from "./domain/time-entry.transitions";

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

				const timeEntry = yield* Effect.fromResult(
					timeEntryTransitions.createTimeEntry({
						workspaceId: params.workspaceId,
						workspaceMemberId: params.workspaceMemberId,
						data: params.data,
						now,
					}),
				);

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
					timeEntryTransitions.updateTimeEntry({
						timeEntry,
						data: params.data,
					}),
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
