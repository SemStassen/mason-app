import { DateTime, Option, Result } from "effect";

import { ProjectId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { Project } from "./project.entity";
import {
  ProjectArchivedError,
  ProjectEndDateBeforeStartDateError,
} from "./project.errors";

export const ensureProjectNotArchived = (
  project: Project
): Result.Result<void, ProjectArchivedError> =>
  Option.isSome(project.archivedAt)
    ? Result.fail(new ProjectArchivedError())
    : Result.succeed(undefined);

const ensureValidDateRange = (params: {
  startDate: Project["startDate"];
  endDate: Project["endDate"];
}): Result.Result<void, ProjectEndDateBeforeStartDateError> => {
  if (
    Option.isSome(params.startDate) &&
    Option.isSome(params.endDate) &&
    DateTime.isLessThan(params.endDate.value, params.startDate.value)
  ) {
    return Result.fail(new ProjectEndDateBeforeStartDateError());
  }

  return Result.succeed(undefined);
};

export const createProject = (params: {
  workspaceId: Project["workspaceId"];
  data: typeof Project.jsonCreate.Type;
}): Result.Result<Project, ProjectEndDateBeforeStartDateError> =>
  Result.gen(function* () {
    const { id, ...rest } = params.data;

    const project = Project.makeUnsafe({
      id: Option.getOrElse(id, () => ProjectId.makeUnsafe(generateUUID())),
      workspaceId: params.workspaceId,
      archivedAt: Option.none(),
      ...rest,
    });

    yield* ensureValidDateRange({
      startDate: project.startDate,
      endDate: project.endDate,
    });

    return project;
  });

export const updateProject = (params: {
  project: Project;
  data: typeof Project.jsonUpdate.Type;
}): Result.Result<
  { entity: Project; changes: typeof Project.update.Type },
  ProjectArchivedError | ProjectEndDateBeforeStartDateError
> =>
  Result.gen(function* () {
    yield* ensureProjectNotArchived(params.project);

    const updatedProject = Project.makeUnsafe({
      ...params.project,
      ...params.data,
    });

    yield* ensureValidDateRange({
      startDate: updatedProject.startDate,
      endDate: updatedProject.endDate,
    });

    return {
      entity: updatedProject,
      changes: params.data,
    };
  });
