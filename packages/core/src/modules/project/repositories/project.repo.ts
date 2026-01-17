import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import type { ProjectId, WorkspaceId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import type { Project } from "../domain";

export class ProjectRepository extends Context.Tag(
  "@mason/project/ProjectRepository"
)<
  ProjectRepository,
  {
    insert: (params: {
      projects: NonEmptyReadonlyArray<Project>;
    }) => Effect.Effect<ReadonlyArray<Project>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      projects: NonEmptyReadonlyArray<Project>;
    }) => Effect.Effect<ReadonlyArray<Project>, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query: AtLeastOne<{
        id: ProjectId;
        includeArchived: boolean;
      }>;
    }) => Effect.Effect<Option.Option<Project>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query: {
        ids?: ReadonlyArray<ProjectId>;
      };
    }) => Effect.Effect<ReadonlyArray<Project>, DatabaseError>;
  }
>() {}
