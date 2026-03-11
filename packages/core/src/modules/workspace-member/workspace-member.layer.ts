import { Effect, Layer, Option } from "effect";
import type { UserId, WorkspaceId } from "~/shared/schemas";
import { WorkspaceMember } from "./domain/workspace-member.entity";
import { WorkspaceMemberRepository } from "./workspace-member.repository";
import {
	WorkspaceMemberAlreadyExistsError,
	WorkspaceMemberModule,
	WorkspaceMemberNotFoundError,
} from "./workspace-member.service";

export const WorkspaceMemberModuleLayer = Layer.effect(
	WorkspaceMemberModule,
	Effect.gen(function* () {
		const workspaceMemberRepo = yield* WorkspaceMemberRepository;

		const assertUserNotWorkspaceMember = Effect.fn(
			"workspace-member.assertUserNotWorkspaceMember",
		)(function* (params: {
			workspaceId: WorkspaceMember["workspaceId"];
			userId: WorkspaceMember["userId"];
		}) {
			const maybeMember = yield* workspaceMemberRepo.findMembership(params);

			if (Option.isSome(maybeMember)) {
				return yield* new WorkspaceMemberAlreadyExistsError();
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

				const workspaceMember = WorkspaceMember.create(params);

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
					return yield* new WorkspaceMemberNotFoundError();
				}
			}),
			assertUserNotWorkspaceMember: assertUserNotWorkspaceMember,
		};
	}),
);
