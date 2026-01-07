import { type Effect, Option, type ParseResult, Schema } from "effect";
import { dual } from "effect/Function";
import { HexColor, ProjectId, type WorkspaceId } from "~/shared/schemas";
import {
  generateUUID,
  isDeleted,
  makeRestore,
  makeSoftDelete,
} from "~/shared/utils";
import { Project } from "../schemas/project.model";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a Project via Schema. */
const _make = (
  input: Project
): Effect.Effect<Project, ParseResult.ParseError> =>
  Schema.validate(Project)(input);

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
): Effect.Effect<Project, ParseResult.ParseError> =>
  _make({
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
  ) => (self: Project) => Effect.Effect<Project, ParseResult.ParseError>,
  (
    self: Project,
    patch: PatchProject
  ) => Effect.Effect<Project, ParseResult.ParseError>
>(2, (self, patch) =>
  _make({
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
const softDeleteProject = makeSoftDelete(_make);

/**
 * Restore a soft-deleted project.
 *
 * @category Transformations
 * @since 0.1.0
 */
const restoreProject = makeRestore(_make);

export const ProjectFns = {
  create: createProject,
  update: updateProject,
  softDelete: softDeleteProject,
  restore: restoreProject,
  isDeleted: isProjectDeleted,
} as const;
