import { Schema } from "effect";
import { generateUUID } from "../../utils/uuid";
import { WorkspaceId } from "../../types/ids";

export const Workspace = Schema.Struct({
  id: Schema.optionalWith(WorkspaceId, {
    default: () => WorkspaceId.make(generateUUID()),
  }),
  // General
  name: Schema.NonEmptyString.pipe(Schema.maxLength(100)),
  slug: Schema.NonEmptyString.pipe(Schema.maxLength(100)),
  // Nullable
  logoUrl: Schema.NullOr(Schema.String),
  metadata: Schema.NullOr(Schema.String),
});

export const WorkspaceToCreate = Schema.Struct({
  // General
  name: Workspace.fields.name,
  slug: Workspace.fields.slug,
});

export const WorkspaceToUpdate = Schema.Struct({
  // General
  name: Schema.optionalWith(Workspace.fields.name, {
    exact: true,
  }),
  slug: Schema.optionalWith(Workspace.fields.slug, {
    exact: true,
  }),
  // Nullable
  logoUrl: Schema.optionalWith(Workspace.fields.logoUrl, {
    exact: true,
  }),
  metadata: Schema.optionalWith(Workspace.fields.metadata, {
    exact: true,
  }),
});
