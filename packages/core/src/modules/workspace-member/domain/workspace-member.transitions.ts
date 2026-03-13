import { Option, Result } from "effect";
import { WorkspaceMemberId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";
import { WorkspaceMember } from "./workspace-member.entity";

export const createWorkspaceMember = (params: {
	workspaceId: WorkspaceMember["workspaceId"];
	userId: WorkspaceMember["userId"];
	role: WorkspaceMember["role"];
}): Result.Result<WorkspaceMember, never> =>
	Result.succeed(
		WorkspaceMember.make({
			...params,
			id: WorkspaceMemberId.makeUnsafe(generateUUID()),
			deletedAt: Option.none(),
		}),
	);
