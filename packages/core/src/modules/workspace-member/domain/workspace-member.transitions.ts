import { Option, Result } from "effect";

import { WorkspaceMemberId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { WorkspaceMember } from "./workspace-member.entity";

export const createWorkspaceMember = (params: {
  workspaceId: WorkspaceMember["workspaceId"];
  userId: WorkspaceMember["userId"];
  role: WorkspaceMember["role"];
  data: typeof WorkspaceMember.jsonCreate.Type;
}): Result.Result<WorkspaceMember, never> =>
  Result.succeed(
    WorkspaceMember.makeUnsafe({
      id: WorkspaceMemberId.makeUnsafe(generateUUID()),
      workspaceId: params.workspaceId,
      userId: params.userId,
      role: params.role,
      displayName: params.data.displayName,
      imageUrl: params.data.imageUrl ?? Option.none(),
      deletedAt: Option.none(),
    })
  );
