import { Effect, Layer, Option } from "effect";
import {
	type UserId,
	type WorkspaceId,
	WorkspaceMemberId,
} from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import { WorkspaceMember } from "./domain/workspace-member.entity";
import { WorkspaceMemberRepository } from "./domain/workspace-member.repository";
import {
	UserAlreadyWorkspaceMemberError,
	UserNotWorkspaceMemberError,
	WorkspaceMemberModule,
} from "./workspace-member.service";

export const WorkspaceMemberModuleLayer = Layer.effect(
	WorkspaceMemberModule,
	Effect.gen(function* () {
		const workspaceMemberRepo = yield* WorkspaceMemberRepository;

		const assertUserNotWorkspaceMember = Effect.fn(
			"workspace-member.assertUserNotWorkspaceMember",
		)(function* (params: { workspaceId: WorkspaceId; userId: UserId }) {
			const maybeMember = yield* workspaceMemberRepo.findMembership(params);

			if (Option.isSome(maybeMember)) {
				return yield* new UserAlreadyWorkspaceMemberError();
			}
		});

		return {
			createWorkspaceMember: Effect.fn(
				"workspace-member.createWorkspaceMember",
			)(function* (params) {
				yield* assertUserNotWorkspaceMember({
					workspaceId: params.workspaceId,
					userId: params.userId,
				});

				const workspaceMember = WorkspaceMember.make({
					...params,
					id: WorkspaceMemberId.makeUnsafe(generateUUID()),
					deletedAt: Option.none(),
				});

				const [persistedWorkspaceMember] = yield* workspaceMemberRepo.insert([
					workspaceMember,
				]);

				return persistedWorkspaceMember;
			}),
			assertUserWorkspaceMember: Effect.fn(
				"workspace-member.assertUserWorkspaceMember",
			)(function* (params: { workspaceId: WorkspaceId; userId: UserId }) {
				const maybeMember = yield* workspaceMemberRepo.findMembership(params);

				if (Option.isNone(maybeMember)) {
					return yield* new UserNotWorkspaceMemberError();
				}
			}),
		};
	}),
);
