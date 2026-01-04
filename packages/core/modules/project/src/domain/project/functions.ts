import {
  Domain,
  ExistingProjectId,
  type ExistingWorkspaceId,
  generateUUID,
  HexColor,
  safeMerge,
} from "@mason/framework";
import { Effect, Option, type ParseResult, Schema } from "effect";
import { dual } from "effect/Function";
import { Project } from "./model";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a Project via Schema. */
const make = (input: Project): Effect.Effect<Project, ParseResult.ParseError> =>
  Schema.decode(Project)(input);

/** Default values for new projects. */
const defaults = {
  hexColor: HexColor.make("#000000"),
  isBillable: false,
  startDate: Option.none(),
  endDate: Option.none(),
  notes: Option.none(),
  _metadata: Option.none(),
  deletedAt: Option.none(),
} as const;

/**
 * Create a new project with generated ID.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const create = (
  input: {
    name: Project["name"];
    hexColor?: string;
    isBillable?: Project["isBillable"];
    startDate?: Project["startDate"];
    endDate?: Project["endDate"];
    notes?: Project["notes"];
    _metadata?: Project["_metadata"];
  },
  workspaceId: ExistingWorkspaceId
): Effect.Effect<Project, ParseResult.ParseError> =>
  Effect.gen(function* () {
    const hexColor = input.hexColor
      ? yield* Schema.decode(HexColor)(input.hexColor)
      : defaults.hexColor;

    return yield* make({
      ...defaults,
      ...input,
      hexColor: hexColor,
      workspaceId: workspaceId,
      id: ExistingProjectId.make(generateUUID()),
      _tag: "@mason/project/Project",
    });
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
export const isDeleted = Domain.isDeleted;

// =============================================================================
// Transformations
// =============================================================================

interface PatchProject {
  name?: Project["name"];
  hexColor?: string;
  isBillable?: Project["isBillable"];
  startDate?: Project["startDate"];
  endDate?: Project["endDate"];
  notes?: Project["notes"];
  _metadata?: Project["_metadata"];
}

/**
 * Update a project with patch data.
 *
 * @category Transformations
 * @since 0.1.0
 */
export const update = dual<
  (
    patch: PatchProject
  ) => (self: Project) => Effect.Effect<Project, ParseResult.ParseError>,
  (
    self: Project,
    patch: PatchProject
  ) => Effect.Effect<Project, ParseResult.ParseError>
>(2, (self, patch) =>
  Effect.gen(function* () {
    const hexColor = patch.hexColor
      ? yield* Schema.decode(HexColor)(patch.hexColor)
      : self.hexColor;

    return yield* make({
      ...self,
      ...patch,
      hexColor: hexColor,
      id: self.id,
      _metadata: safeMerge(self._metadata, patch._metadata),
    });
  })
);

/**
 * Soft delete a project.
 *
 * @category Transformations
 * @since 0.1.0
 */
export const softDelete = Domain.makeSoftDelete(make);

/**
 * Restore a soft-deleted project.
 *
 * @category Transformations
 * @since 0.1.0
 */
export const restore = Domain.makeRestore(make);
