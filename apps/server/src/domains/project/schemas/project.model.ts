import { DateTime, Option, Schema } from "effect";
import { HexColor, JsonRecord, ProjectId, WorkspaceId } from "~/shared/schemas";

export type ProjectName = typeof ProjectName.Type;
export const ProjectName = Schema.NonEmptyString.pipe(Schema.maxLength(255));

/**
 * Project domain model.
 *
 * @category Models
 * @since 0.1.0
 */
export type Project = typeof Project.Type;
export const Project = Schema.TaggedStruct("Project", {
  id: ProjectId,
  workspaceId: WorkspaceId,
  name: ProjectName,
  hexColor: HexColor,
  isBillable: Schema.Boolean,
  startDate: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
  endDate: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
  notes: Schema.OptionFromSelf(JsonRecord),
  deletedAt: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
}).pipe(
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
