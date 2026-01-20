import { DateTime, Effect, Option, Schema } from "effect";
import {
  HexColor,
  JsonRecord,
  Model,
  ProjectId,
  WorkspaceId,
} from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import { ProjectTransitionError } from "./errors";

export class Project extends Model.Class<Project>("Project")(
  {
    id: Model.DomainManaged(ProjectId),
    workspaceId: Model.SystemImmutable(WorkspaceId),
    name: Model.Mutable(Schema.NonEmptyString.pipe(Schema.maxLength(255))),
    hexColor: Model.OptionalMutable(HexColor),
    isBillable: Model.OptionalMutable(Schema.Boolean),
    startDate: Model.OptionalMutable(
      Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf)
    ),
    endDate: Model.OptionalMutable(
      Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf)
    ),
    notes: Model.OptionalMutable(Schema.OptionFromSelf(JsonRecord)),
    archivedAt: Model.DomainManaged(
      Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf)
    ),
  },
  {
    identifier: "Project",
    title: "Project",
    description: "A project within a workspace",
  }
) {
  private static _validate = (input: typeof Project.model.Type) =>
    Schema.validate(Project)(input);

  static fromInput = (input: typeof Project.create.Type) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(Project.create)(input);

      const project = yield* Project._validate({
        name: safeInput.name,
        workspaceId: safeInput.workspaceId,
        hexColor: safeInput.hexColor ?? HexColor.make("#000000"),
        isBillable: safeInput.isBillable ?? false,
        startDate: safeInput.startDate ?? Option.none(),
        endDate: safeInput.endDate ?? Option.none(),
        notes: safeInput.notes ?? Option.none(),
        id: ProjectId.make(generateUUID()),
        archivedAt: Option.none(),
      });

      yield* project.assertValidDates();

      return project;
    });

  patch = (patch: typeof Project.patch.Type) =>
    Effect.gen(this, function* () {
      const safePatch = yield* Schema.decodeUnknown(Project.patch)(patch);

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
