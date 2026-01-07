import { DateTime, Effect, Option, Schema } from "effect";
import { dual } from "effect/Function";
import { HexColor, ProjectId, type WorkspaceId } from "~/shared/schemas";
import {
  generateUUID,
  isDeleted,
  makeRestore,
  makeSoftDelete,
} from "~/shared/utils";
import { Project } from "../schemas/project.model";
import { ProjectDomainError } from "./errors";

// =============================================================================
// Helpers
// =============================================================================

const _validateDates = (
  input: Project
): Effect.Effect<Project, ProjectDomainError> =>
  Effect.gen(function* () {
    const startDate = Option.getOrNull(input.startDate);
    const endDate = Option.getOrNull(input.endDate);
    if (startDate && endDate && DateTime.lessThan(endDate, startDate)) {
      return yield* Effect.fail(
        new ProjectDomainError({
          cause: "End date must be after start date",
        })
      );
    }

    return input;
  });

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a Project via Schema. */
const _validate = (
  input: Project
): Effect.Effect<Project, ProjectDomainError> =>
  Effect.gen(function* () {
    const validated = yield* Schema.validate(Project)(input);

    return yield* _validateDates(validated);
  }).pipe(
    Effect.catchTags({
      ParseError: (e) => Effect.fail(new ProjectDomainError({ cause: e })),
    })
  );

/** Default values for new projects. */
const defaults = {
  hexColor: HexColor.make("#000000"),
  isBillable: false,
  startDate: Option.none(),
  endDate: Option.none(),
  notes: Option.none(),
  deletedAt: Option.none(),
} as const;

/**
 * Create a new project with generated ID.
 *
 * @category Constructors
 * @since 0.1.0
 */
const createProject = (
  input: {
    name: Project["name"];
    hexColor?: Project["hexColor"];
    isBillable?: Project["isBillable"];
    startDate?: Project["startDate"];
    endDate?: Project["endDate"];
    notes?: Project["notes"];
  },
  system: {
    workspaceId: WorkspaceId;
  }
): Effect.Effect<Project, ProjectDomainError> =>
  _validate({
    ...defaults,
    ...input,
    workspaceId: system.workspaceId,
    id: ProjectId.make(generateUUID()),
    _tag: "Project",
  });

// =============================================================================
// Predicates
// =============================================================================

/**
 * Check if project is deleted.
 *
 * @category Predicates
 * @since 0.1.0
 */
const isProjectDeleted = isDeleted;

// =============================================================================
// Transformations
// =============================================================================

interface PatchProject {
  name?: Project["name"];
  hexColor?: Project["hexColor"];
  isBillable?: Project["isBillable"];
  startDate?: Project["startDate"];
  endDate?: Project["endDate"];
  notes?: Project["notes"];
}

/**
 * Update a project with patch data.
 *
 * @category Transformations
 * @since 0.1.0
 */
const updateProject = dual<
  (
    patch: PatchProject
  ) => (self: Project) => Effect.Effect<Project, ProjectDomainError>,
  (
    self: Project,
    patch: PatchProject
  ) => Effect.Effect<Project, ProjectDomainError>
>(2, (self, patch) =>
  _validate({
    ...self,
    ...patch,
    id: self.id,
  })
);

/**
 * Soft delete a project.
 *
 * @category Transformations
 * @since 0.1.0
 */
const softDeleteProject = makeSoftDelete(_validate);

/**
 * Restore a soft-deleted project.
 *
 * @category Transformations
 * @since 0.1.0
 */
const restoreProject = makeRestore(_validate);

export const ProjectFns = {
  create: createProject,
  update: updateProject,
  softDelete: softDeleteProject,
  restore: restoreProject,
  isDeleted: isProjectDeleted,
} as const;
