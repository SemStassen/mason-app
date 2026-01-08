import { Schema } from "effect";
import { WorkspaceId } from "~/domains/workspace";
import { HexColor, JsonRecord } from "~/shared/schemas";

export type ProjectId = typeof ProjectId.Type;
export const ProjectId = Schema.UUID.pipe(Schema.brand("ProjectId"));

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
  Schema.annotations({
    identifier: "Project",
    title: "Project",
    description: "A project within a workspace",
  })
);
