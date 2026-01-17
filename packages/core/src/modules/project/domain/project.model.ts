import { DateTime, Effect, Option, Schema } from "effect";
import { HexColor, JsonRecord, ProjectId, WorkspaceId } from "~/shared/schemas";
import { generateUUID, type SchemaFields } from "~/shared/utils";
import { ProjectTransitionError } from "./errors";

export class Project extends Schema.TaggedClass<Project>("Project")(
  "Project",
  {
    id: ProjectId,
    workspaceId: WorkspaceId,
    name: Schema.NonEmptyString.pipe(Schema.maxLength(255)),
    hexColor: HexColor,
    isBillable: Schema.Boolean,
    startDate: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
    endDate: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
    notes: Schema.OptionFromSelf(JsonRecord),
    archivedAt: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
  },
  {
    identifier: "Project",
    title: "Project",
    description: "A project within a workspace",
  }
) {
  private static _validate = (input: SchemaFields<typeof Project>) =>
    Schema.decodeUnknown(Project)(input);

  private static _defaultValues = {
    hexColor: HexColor.make("#000000"),
    isBillable: false,
    startDate: Option.none(),
    endDate: Option.none(),
    notes: Option.none(),
    archivedAt: Option.none(),
  };

  static create = (input: CreateProject) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(CreateProject)(input);

      const project = yield* Project._validate({
        ...Project._defaultValues,
        ...safeInput,
        id: ProjectId.make(generateUUID()),
        _tag: "Project",
      });

      yield* project.assertValidDates();

      return project;
    });

  patch = (patch: PatchProject) =>
    Effect.gen(this, function* () {
      const safePatch = yield* Schema.decodeUnknown(PatchProject)(patch);

      const patched = yield* Project._validate({
        ...this,
        ...safePatch,
      });

      yield* patched.assertValidDates();

      return patched;
    });

  archive = () =>
    Effect.gen(this, function* () {
      const now = yield* DateTime.now;

      return yield* Project._validate({
        ...this,
        archivedAt: Option.some(now),
      });
    });

  restore = () =>
    Effect.gen(this, function* () {
      return yield* Project._validate({
        ...this,
        archivedAt: Option.none(),
      });
    });

  /** Predicates */

  readonly isArchived = () => Option.isSome(this.archivedAt);

  /** Assertions */

  private readonly assertValidDates = () =>
    Effect.gen(this, function* () {
      const startDate = Option.getOrNull(this.startDate);
      const endDate = Option.getOrNull(this.endDate);

      if (startDate && endDate && DateTime.lessThan(endDate, startDate)) {
        return yield* Effect.fail(
          new ProjectTransitionError({
            cause: "End date must be after start date",
          })
        );
      }
    });
}

export type CreateProject = typeof CreateProject.Type;
export const CreateProject = Schema.Struct({
  workspaceId: WorkspaceId,
  name: Project.fields.name,
  hexColor: Schema.optionalWith(Project.fields.hexColor, {
    exact: true,
  }),
  isBillable: Schema.optionalWith(Project.fields.isBillable, {
    exact: true,
  }),
  startDate: Schema.optionalWith(Project.fields.startDate, {
    exact: true,
  }),
  endDate: Schema.optionalWith(Project.fields.endDate, {
    exact: true,
  }),
  notes: Schema.optionalWith(Project.fields.notes, {
    exact: true,
  }),
});

export type PatchProject = typeof PatchProject.Type;
export const PatchProject = Schema.Struct({
  name: Schema.optionalWith(Project.fields.name, {
    exact: true,
  }),
  hexColor: Schema.optionalWith(Project.fields.hexColor, {
    exact: true,
  }),
  isBillable: Schema.optionalWith(Project.fields.isBillable, {
    exact: true,
  }),
  startDate: Schema.optionalWith(Project.fields.startDate, {
    exact: true,
  }),
  endDate: Schema.optionalWith(Project.fields.endDate, {
    exact: true,
  }),
  notes: Schema.optionalWith(Project.fields.notes, {
    exact: true,
  }),
});
