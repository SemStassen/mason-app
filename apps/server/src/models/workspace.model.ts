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
