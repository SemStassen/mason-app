import { Schema } from 'effect';

export class Workspace extends Schema.Struct({
  id: Schema.String.pipe(Schema.brand('WorkspaceId')),
  name: Schema.NonEmptyString.pipe(Schema.maxLength(100)),
  slug: Schema.NonEmptyString.pipe(Schema.maxLength(100)),
  logoUrl: Schema.NullOr(Schema.String),
  metadata: Schema.NullOr(Schema.String),
}) {}

export const CreateWorkspaceRequest = Schema.Struct({
  name: Workspace.fields.name,
  slug: Workspace.fields.slug,
});

export const UpdateWorkspaceRequest = Schema.Struct({
  name: Schema.optionalWith(Workspace.fields.name, {
    exact: true,
  }),
  slug: Schema.optionalWith(Workspace.fields.slug, {
    exact: true,
  }),
  logoUrl: Schema.optionalWith(Workspace.fields.logoUrl, {
    exact: true,
  }),
  metadata: Schema.optionalWith(Workspace.fields.metadata, {
    exact: true,
  }),
});

export const WorkspaceResponse = Schema.Struct({
  ...Workspace.fields,
  id: Schema.String,
});
