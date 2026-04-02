import { ServiceMap } from "effect";
import type { Effect, Option } from "effect";

import type { RepositoryError } from "#shared/repository/index";

import type { WorkspaceMember } from "./domain/workspace-member.entity";

export interface WorkspaceMemberRepositoryShape {
  readonly insert: (
    data: typeof WorkspaceMember.insert.Type
  ) => Effect.Effect<WorkspaceMember, RepositoryError>;
  readonly update: (params: {
    workspaceId: WorkspaceMember["workspaceId"];
    id: WorkspaceMember["id"];
    update: typeof WorkspaceMember.update.Type;
  }) => Effect.Effect<WorkspaceMember, RepositoryError>;
  readonly findById: (params: {
    workspaceId: WorkspaceMember["workspaceId"];
    id: WorkspaceMember["id"];
  }) => Effect.Effect<Option.Option<WorkspaceMember>, RepositoryError>;
  readonly findMembership: (params: {
    workspaceId: WorkspaceMember["workspaceId"];
    userId: WorkspaceMember["userId"];
  }) => Effect.Effect<Option.Option<WorkspaceMember>, RepositoryError>;
  readonly listByUserId: (
    userId: WorkspaceMember["userId"]
  ) => Effect.Effect<ReadonlyArray<WorkspaceMember>, RepositoryError>;
}

export class WorkspaceMemberRepository extends ServiceMap.Service<
  WorkspaceMemberRepository,
  WorkspaceMemberRepositoryShape
>()("@recount/workspace-member/WorkspaceMemberRepository") {}
