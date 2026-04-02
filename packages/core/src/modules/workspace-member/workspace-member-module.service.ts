import { Schema, ServiceMap } from "effect";
import type { Effect } from "effect";

import type { RepositoryError } from "#shared/repository/index";

import { WorkspaceMember } from "./domain/workspace-member.entity";

export class WorkspaceMemberAlreadyExistsError extends Schema.TaggedErrorClass<WorkspaceMemberAlreadyExistsError>()(
  "workspace-member/WorkspaceMemberAlreadyExistsError",
  {}
) {}

export class WorkspaceMemberNotFoundError extends Schema.TaggedErrorClass<WorkspaceMemberNotFoundError>()(
  "workspace-member/WorkspaceMemberNotFoundError",
  {
    lookup: Schema.Union([
      Schema.Struct({ workspaceMemberId: WorkspaceMember.fields.id }),
      Schema.Struct({
        workspaceId: WorkspaceMember.fields.workspaceId,
        userId: WorkspaceMember.fields.userId,
      }),
    ]),
  },
  {
    httpApiStatus: 404,
  }
) {}

interface WorkspaceMemberModuleShape {
  readonly createWorkspaceMember: (params: {
    workspaceId: WorkspaceMember["workspaceId"];
    userId: WorkspaceMember["userId"];
    role: WorkspaceMember["role"];
    data: typeof WorkspaceMember.jsonCreate.Type;
  }) => Effect.Effect<
    WorkspaceMember,
    WorkspaceMemberAlreadyExistsError | RepositoryError
  >;
  readonly assertUserWorkspaceMember: (params: {
    workspaceId: WorkspaceMember["workspaceId"];
    userId: WorkspaceMember["userId"];
  }) => Effect.Effect<void, WorkspaceMemberNotFoundError | RepositoryError>;
  readonly assertUserNotWorkspaceMember: (params: {
    workspaceId: WorkspaceMember["workspaceId"];
    userId: WorkspaceMember["userId"];
  }) => Effect.Effect<
    void,
    WorkspaceMemberAlreadyExistsError | RepositoryError
  >;
  readonly listByUserId: (
    userId: WorkspaceMember["userId"]
  ) => Effect.Effect<ReadonlyArray<WorkspaceMember>, RepositoryError>;
}

export class WorkspaceMemberModule extends ServiceMap.Service<
  WorkspaceMemberModule,
  WorkspaceMemberModuleShape
>()("@recount/workspace-member/WorkspaceMemberModule") {}
