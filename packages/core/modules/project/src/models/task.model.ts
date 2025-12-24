import { generateUUID, ProjectId, TaskId, WorkspaceId } from "@mason/framework";
import { Effect, Schema } from "effect";

export class Task extends Schema.Class<Task>("project/Task")({
  id: TaskId,
  // References
  workspaceId: WorkspaceId,
  projectId: ProjectId,
  // General
  name: Schema.NonEmptyString.pipe(Schema.maxLength(255)),
  // Nullable
  _metadata: Schema.NullOr(
    Schema.Struct({
      source: Schema.optionalWith(Schema.Literal("float"), {
        exact: true,
      }),
      externalId: Schema.optionalWith(Schema.String, {
        exact: true,
      }),
    })
  ),
  // Metadata
  deletedAt: Schema.NullOr(Schema.DateFromSelf),
}) {
  static readonly Create = Schema.Struct({
    projectId: Task.fields.projectId,
    name: Task.fields.name,
    _metadata: Schema.optionalWith(Task.fields._metadata, {
      default: () => null,
      exact: true,
    }),
  });

  static makeFromCreate(
    input: typeof Task.Create.Type,
    workspaceId: WorkspaceId
  ) {
    return Schema.decodeUnknown(Task.Create)(input).pipe(
      Effect.map((validated) =>
        Task.make({
          ...validated,
          id: TaskId.make(generateUUID()),
          workspaceId: workspaceId,
          deletedAt: null,
        })
      )
    );
  }

  static readonly Patch = Schema.Struct({
    name: Schema.optionalWith(Task.fields.name, { exact: true }),
    _metadata: Schema.optionalWith(Task.fields._metadata, { exact: true }),
  });
  patch(updates: typeof Task.Patch.Type) {
    return Schema.decodeUnknown(Task.Patch)(updates).pipe(
      Effect.map((validated) =>
        Task.make({
          ...this,
          ...validated,
          _metadata: { ...this._metadata, ...validated._metadata },
        })
      )
    );
  }

  softDelete() {
    if (this.deletedAt) {
      return this;
    }
    return Task.make({ ...this, deletedAt: new Date() });
  }
}
