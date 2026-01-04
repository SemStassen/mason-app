import {
  ExistingProjectId,
  ExistingWorkspaceId,
  HexColor,
  JsonRecord,
} from "@mason/framework";
import { DateTime, Option, Schema } from "effect";

/**
 * Project field definitions.
 *
 * Used to construct the Project domain model and derive DTOs.
 * Access individual fields via `ProjectFields.fields.fieldName`.
 *
 * @category Schema
 * @since 0.1.0
 */
export const ProjectFields = Schema.TaggedStruct("@mason/project/Project", {
  id: ExistingProjectId,
  workspaceId: ExistingWorkspaceId,
  name: Schema.NonEmptyString.pipe(Schema.maxLength(255)),
  hexColor: HexColor,
  isBillable: Schema.Boolean,
  startDate: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
  endDate: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
  notes: Schema.OptionFromSelf(JsonRecord),
  _metadata: Schema.OptionFromSelf(
    Schema.Struct({
      source: Schema.optionalWith(Schema.Literal("float"), { exact: true }),
      externalId: Schema.optionalWith(Schema.String, { exact: true }),
    })
  ),
  deletedAt: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
});

/**
 * Project domain model.
 *
 * @category Models
 * @since 0.1.0
 */
export type Project = typeof Project.Type;
export const Project = ProjectFields.pipe(
  Schema.Data,
  Schema.filter((input) => {
    const startDate = Option.getOrNull(input.startDate);
    const endDate = Option.getOrNull(input.endDate);
    if (startDate && endDate) {
      return DateTime.greaterThan(endDate, startDate);
    }
    return true;
  }, {}),
  Schema.annotations({
    identifier: "Project",
    title: "Project",
    description: "A project within a workspace",
  })
);
