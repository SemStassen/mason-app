import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/shared/errors";
import type { ProjectId, WorkspaceId } from "~/shared/schemas";
import type { Project } from "../schemas/project.model";

export class ProjectRepository extends Context.Tag(
  "@mason/project/ProjectRepository"
)<
  ProjectRepository,
  {
    upsert: (params: {
      workspaceId: WorkspaceId;
      projects: NonEmptyReadonlyArray<Project>;
    }) => Effect.Effect<ReadonlyArray<Project>, DatabaseError>;
    softDelete: (params: {
      workspaceId: WorkspaceId;
      projectIds: NonEmptyReadonlyArray<ProjectId>;
    }) => Effect.Effect<void, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query: {
        id?: ProjectId;
        _includeDeleted?: boolean;
      };
    }) => Effect.Effect<Option.Option<Project>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query: {
        ids?: ReadonlyArray<ProjectId>;
        _includeDeleted?: boolean;
      };
    }) => Effect.Effect<ReadonlyArray<Project>, DatabaseError>;
  }
>() {}
