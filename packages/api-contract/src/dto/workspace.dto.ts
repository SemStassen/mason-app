import { Schema } from "effect";

const Workspace = Schema.Struct({
  id: Schema.NonEmptyString,
  // General
  name: Schema.NonEmptyString,
  slug: Schema.NonEmptyString,
  // Optional
  logoUrl: Schema.String,
  metadata: Schema.String,
});

export const CreateWorkspaceRequest = Schema.Struct({
  // General
  name: Workspace.fields.name,
  slug: Workspace.fields.slug,
});

export const UpdateWorkspaceRequest = Schema.Struct({
  // General
  name: Schema.optionalWith(Workspace.fields.name, {
    exact: true,
  }),
  slug: Schema.optionalWith(Workspace.fields.slug, {
    exact: true,
  }),
  // Optional
  logoUrl: Schema.optionalWith(Schema.NullOr(Workspace.fields.logoUrl), {
    exact: true,
  }),
  metadata: Schema.optionalWith(Schema.NullOr(Workspace.fields.metadata), {
    exact: true,
  }),
});

export const WorkspaceResponse = Schema.TaggedStruct("WorkspaceResponse", {
  ...Workspace.fields,
  // Optional
  logoUrl: Schema.NullOr(Workspace.fields.logoUrl),
  metadata: Schema.NullOr(Workspace.fields.metadata),
});
