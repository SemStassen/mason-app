import { Schema } from "effect";
import { WorkspaceId } from "~/shared/schemas";

export type WorkspaceName = typeof WorkspaceName.Type;
export const WorkspaceName = Schema.NonEmptyString.pipe(Schema.maxLength(100));

export type WorkspaceSlug = typeof WorkspaceSlug.Type;
export const WorkspaceSlug = Schema.NonEmptyString.pipe(Schema.maxLength(100));

/**
 * Workspace domain model.
 *
 * Represents a workspace.
 *
 * @category Models
 * @since 0.1.0
 */
export type Workspace = typeof Workspace.Type;
export const Workspace = Schema.TaggedStruct("Workspace", {
  id: WorkspaceId,
  // General
  name: WorkspaceName,
  slug: WorkspaceSlug,
  // Optional
  logoUrl: Schema.OptionFromSelf(Schema.NonEmptyString),
  metadata: Schema.OptionFromSelf(Schema.NonEmptyString),
}).pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "Workspace",
    title: "Workspace",
    description: "A workspace",
  })
);
