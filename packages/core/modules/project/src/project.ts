import {
  ExistingProjectId,
  ExistingWorkspaceId,
  generateUUID,
  HexColor,
  JsonRecord,
} from "@mason/framework";
import { DateTime, Effect, Schema } from "effect";
import { dual } from "effect/Function";
import type { ParseError } from "effect/ParseResult";

// =============================================================================
// Schema
// =============================================================================

const ProjectBase = Schema.TaggedStruct("Project", {
  id: ExistingProjectId,
  workspaceId: ExistingWorkspaceId,
  name: Schema.NonEmptyString.pipe(Schema.maxLength(255)),
  hexColor: HexColor,
  isBillable: Schema.Boolean,
  startDate: Schema.NullOr(Schema.DateTimeUtcFromSelf),
  endDate: Schema.NullOr(Schema.DateTimeUtcFromSelf),
  notes: Schema.NullOr(JsonRecord),
  _metadata: Schema.NullOr(
    Schema.Struct({
      source: Schema.optionalWith(Schema.Literal("float"), {
        exact: true,
      }),
      externalId: Schema.optionalWith(Schema.String, {
        exact: true,
      }),
    })
  ),
  deletedAt: Schema.NullOr(Schema.DateTimeUtcFromSelf),
});

export const Project = ProjectBase.pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "Project",
    title: "Project",
    description: "A project within a workspace",
  })
);

export type Project = Schema.Schema.Type<typeof Project>;

// =============================================================================
// Creation
// =============================================================================

export const CreateProject = Schema.Struct({
  workspaceId: ProjectBase.fields.workspaceId,
  name: ProjectBase.fields.name,
  hexColor: Schema.optionalWith(ProjectBase.fields.hexColor, {
    exact: true,
  }),
  isBillable: Schema.optionalWith(ProjectBase.fields.isBillable, {
    exact: true,
  }),
  startDate: Schema.optionalWith(ProjectBase.fields.startDate, {
    exact: true,
  }),
  endDate: Schema.optionalWith(ProjectBase.fields.endDate, {
    exact: true,
  }),
  notes: Schema.optionalWith(ProjectBase.fields.notes, {
    exact: true,
  }),
  _metadata: Schema.optionalWith(ProjectBase.fields._metadata, {
    exact: true,
  }),
});

/**
 * Create a project from creation input.
 *
 * @since 0.1.0
 */
export const createProject = (
  input: typeof CreateProject.Type
): Effect.Effect<Project, ParseError> =>
  Schema.decodeUnknown(CreateProject)(input).pipe(
    Effect.flatMap((validated) =>
      Schema.decodeUnknown(Project)({
        ...validated,
        id: ExistingProjectId.make(generateUUID()),
        deletedAt: null,
      })
    )
  );

// =============================================================================
// Updates
// =============================================================================

export const PatchProject = Schema.Struct({
  name: Schema.optionalWith(ProjectBase.fields.name, { exact: true }),
  hexColor: Schema.optionalWith(ProjectBase.fields.hexColor, { exact: true }),
  isBillable: Schema.optionalWith(ProjectBase.fields.isBillable, {
    exact: true,
  }),
  startDate: Schema.optionalWith(ProjectBase.fields.startDate, {
    exact: true,
  }),
  endDate: Schema.optionalWith(ProjectBase.fields.endDate, { exact: true }),
  notes: Schema.optionalWith(ProjectBase.fields.notes, { exact: true }),
  _metadata: Schema.optionalWith(ProjectBase.fields._metadata, {
    exact: true,
  }),
});

/**
 * Update a project with patch data.
 *
 * @since 0.1.0
 */
export const updateProject = dual<
  (
    updates: typeof PatchProject.Type
  ) => (self: Project) => Effect.Effect<Project, ParseError>,
  (
    self: Project,
    updates: typeof PatchProject.Type
  ) => Effect.Effect<Project, ParseError>
>(2, (self, updates) =>
  Schema.decodeUnknown(PatchProject)(updates).pipe(
    Effect.flatMap((validated) => {
      const mergedMetadata =
        self._metadata && validated._metadata
          ? { ...self._metadata, ...validated._metadata }
          : (validated._metadata ?? self._metadata);

      return Schema.decodeUnknown(Project)({
        ...self,
        ...validated,
        _metadata: mergedMetadata,
      });
    })
  )
);

// =============================================================================
// Soft Delete
// =============================================================================

/**
 * Soft delete a project by setting deletedAt.
 *
 * @since 0.1.0
 */
export const softDeleteProject = (self: Project): Effect.Effect<Project> =>
  Effect.gen(function* () {
    if (self.deletedAt) {
      return self;
    }
    const deletedAt = yield* DateTime.now;
    return { ...self, deletedAt };
  });
