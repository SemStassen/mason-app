import { DateTime, Effect, Layer, Option } from "effect";
import { WorkspaceInvitation } from "./domain/workspace-invitation.entity";
import {
	acceptWorkspaceInvitation,
	cancelWorkspaceInvitation,
	rejectWorkspaceInvitation,
	renewWorkspaceInvitation,
} from "./domain/workspace-invitation.transitions";
import { WorkspaceInvitationRepository } from "./workspace-invitation.repository";
import {
	WorkspaceInvitationModule,
	WorkspaceInvitationNotFoundError,
} from "./workspace-invitation.service";

export const WorkspaceInvitationModuleLayer = Layer.effect(
	WorkspaceInvitationModule,
	Effect.gen(function* () {
		const workspaceInvitationRepo = yield* WorkspaceInvitationRepository;

		return {
			createOrRenewPendingWorkspaceInvitation: Effect.fn(
				"workspace-invitation.createOrRenewPendingWorkspaceInvitation",
			)(function* (params) {
				const now = yield* DateTime.now;

				const maybeActivePendingWorkspaceInvitation =
					yield* workspaceInvitationRepo.findActivePendingByEmail({
						workspaceId: params.workspaceId,
						email: params.data.email,
					});

				if (Option.isSome(maybeActivePendingWorkspaceInvitation)) {
					const renewedWorkspaceInvitation = yield* Effect.fromResult(
						renewWorkspaceInvitation({
							workspaceInvitation: maybeActivePendingWorkspaceInvitation.value,
							now: now,
						}),
					).pipe(
						Effect.catch(() =>
							Effect.die(
								"invariant violated: findActivePendingByEmail returned a non-pending or expired invitation",
							),
						),
					);

					const persistedWorkspaceInvitation =
						yield* workspaceInvitationRepo.update(renewedWorkspaceInvitation);

					return persistedWorkspaceInvitation;
				}

				const workspaceInvitation = WorkspaceInvitation.create({
					...params.data,
					inviterId: params.inviterId,
					workspaceId: params.workspaceId,
					now: now,
				});

				const [persistedWorkspaceInvitation] =
					yield* workspaceInvitationRepo.insert([workspaceInvitation]);

				return persistedWorkspaceInvitation;
			}),
			cancelWorkspaceInvitation: Effect.fn(
				"workspace-invitation.cancelWorkspaceInvitation",
			)(function* (params) {
				const now = yield* DateTime.now;

				const workspaceInvitation = yield* workspaceInvitationRepo
					.findById({
						workspaceId: params.workspaceId,
						id: params.id,
					})
					.pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(
										new WorkspaceInvitationNotFoundError({
											workspaceInvitationId: params.id,
										}),
									),
								onSome: Effect.succeed,
							}),
						),
					);

				const canceledWorkspaceInvitation = yield* Effect.fromResult(
					cancelWorkspaceInvitation({
						workspaceInvitation: workspaceInvitation,
						now: now,
					}),
				);

				const persistedWorkspaceInvitation =
					yield* workspaceInvitationRepo.update(canceledWorkspaceInvitation);

				return persistedWorkspaceInvitation;
			}),
			acceptWorkspaceInvitation: Effect.fn(
				"workspace-invitation.acceptWorkspaceInvitation",
			)(function* (params) {
				const now = yield* DateTime.now;

				const workspaceInvitation = yield* workspaceInvitationRepo
					.findByInvitationId({
						id: params.id,
					})
					.pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(
										new WorkspaceInvitationNotFoundError({
											workspaceInvitationId: params.id,
										}),
									),
								onSome: Effect.succeed,
							}),
						),
					);

				const acceptedWorkspaceInvitation = yield* Effect.fromResult(
					acceptWorkspaceInvitation({
						workspaceInvitation: workspaceInvitation,
						email: params.email,
						now: now,
					}),
				);

				const persistedWorkspaceInvitation =
					yield* workspaceInvitationRepo.update(acceptedWorkspaceInvitation);

				return persistedWorkspaceInvitation;
			}),
			rejectWorkspaceInvitation: Effect.fn(
				"workspace-invitation.rejectWorkspaceInvitation",
			)(function* (params) {
				const now = yield* DateTime.now;

				const workspaceInvitation = yield* workspaceInvitationRepo
					.findByInvitationId({
						id: params.id,
					})
					.pipe(
						Effect.flatMap(
							Option.match({
								onNone: () =>
									Effect.fail(
										new WorkspaceInvitationNotFoundError({
											workspaceInvitationId: params.id,
										}),
									),
								onSome: Effect.succeed,
							}),
						),
					);

				const rejectedWorkspaceInvitation = yield* Effect.fromResult(
					rejectWorkspaceInvitation({
						workspaceInvitation: workspaceInvitation,
						email: params.email,
						now: now,
					}),
				);

				const persistedWorkspaceInvitation =
					yield* workspaceInvitationRepo.update(rejectedWorkspaceInvitation);

				return persistedWorkspaceInvitation;
			}),
		};
	}),
);
