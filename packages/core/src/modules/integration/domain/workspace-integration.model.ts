import { DateTime, Effect, Option, Schema } from "effect";
import {
  EncryptedApiKey,
  MemberId,
  WorkspaceId,
  WorkspaceIntegrationId,
} from "~/shared/schemas";
import { generateUUID, type SchemaFields } from "~/shared/utils";

export class WorkspaceIntegration extends Schema.TaggedClass<WorkspaceIntegration>(
  "WorkspaceIntegration"
)(
  "WorkspaceIntegration",
  {
    id: WorkspaceIntegrationId,
    workspaceId: WorkspaceId,
    createdByMemberId: MemberId,
    provider: Schema.Literal("float").pipe(
      Schema.brand("WorkspaceIntegrationProvider")
    ),
    encryptedApiKey: EncryptedApiKey,
    _metadata: Schema.OptionFromSelf(
      Schema.Struct({
        lastSyncedAt: Schema.optionalWith(Schema.DateTimeUtcFromSelf, {
          exact: true,
        }),
      })
    ),
    createdAt: Schema.DateTimeUtcFromSelf,
  },
  {
    identifier: "WorkspaceIntegration",
    title: "Workspace Integration",
    description: "An integration connecting a workspace to an external service",
  }
) {
  private static _validate = (
    input: SchemaFields<typeof WorkspaceIntegration>
  ) => Schema.decodeUnknown(WorkspaceIntegration)(input);

  private static _makeDefaults = () =>
    Effect.gen(function* () {
      const currentDate = yield* DateTime.now;

      return {
        _metadata: Option.none(),
        createdAt: currentDate,
      };
    });

  static create = (input: CreateWorkspaceIntegration) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(CreateWorkspaceIntegration)(
        input
      );

      const defaults = yield* WorkspaceIntegration._makeDefaults();

      return yield* WorkspaceIntegration._validate({
        ...defaults,
        ...safeInput,
        id: WorkspaceIntegrationId.make(generateUUID()),
        _tag: "WorkspaceIntegration",
      });
    });

  patch = (input: PatchWorkspaceIntegration) =>
    Effect.gen(this, function* () {
      const safeInput = yield* Schema.decodeUnknown(PatchWorkspaceIntegration)(
        input
      );
      return yield* WorkspaceIntegration._validate({
        ...this,
        ...safeInput,
        id: this.id,
        _tag: "WorkspaceIntegration",
      });
    });
}

export type CreateWorkspaceIntegration = typeof CreateWorkspaceIntegration.Type;
export const CreateWorkspaceIntegration = Schema.Struct({
  createdByMemberId: MemberId,
  workspaceId: WorkspaceId,
  provider: WorkspaceIntegration.fields.provider,
  encryptedApiKey: EncryptedApiKey,
});

export type PatchWorkspaceIntegration = typeof PatchWorkspaceIntegration.Type;
export const PatchWorkspaceIntegration = Schema.Struct({
  encryptedApiKey: EncryptedApiKey,
});
