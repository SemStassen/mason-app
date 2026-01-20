import { DateTime, Effect, Schema } from "effect";
import {
  EncryptedApiKey,
  MemberId,
  Model,
  PlainApiKey,
  WorkspaceId,
  WorkspaceIntegrationId,
} from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";

export class WorkspaceIntegration extends Model.Class<WorkspaceIntegration>(
  "WorkspaceIntegration"
)(
  {
    id: Model.DomainManaged(WorkspaceIntegrationId),
    workspaceId: Model.SystemImmutable(WorkspaceId),
    createdByMemberId: Model.SystemImmutable(MemberId),
    provider: Model.UserImmutable(
      Schema.Literal("float").pipe(Schema.brand("WorkspaceIntegrationProvider"))
    ),
    apiKey: Model.TransformedImmutable(EncryptedApiKey, PlainApiKey),
    _metadata: Model.Mutable(
      Schema.OptionFromSelf(
        Schema.Struct({
          lastSyncedAt: Schema.optionalWith(Schema.DateTimeUtcFromSelf, {
            exact: true,
          }),
        })
      )
    ),
    createdAt: Model.DomainManaged(Schema.DateTimeUtcFromSelf),
  },
  {
    identifier: "WorkspaceIntegration",
    title: "Workspace Integration",
    description: "An integration connecting a workspace to an external service",
  }
) {
  private static _validate = (input: typeof WorkspaceIntegration.model.Type) =>
    Schema.validate(WorkspaceIntegration)(input);

  static fromInput = (input: typeof WorkspaceIntegration.create.Type) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(
        WorkspaceIntegration.create
      )(input);

      const now = yield* DateTime.now;

      return yield* WorkspaceIntegration._validate({
        id: WorkspaceIntegrationId.make(generateUUID()),
        createdAt: now,
        ...safeInput,
      });
    });

  patch = (patch: typeof WorkspaceIntegration.patch.Type) =>
    Effect.gen(this, function* () {
      const safePatch = yield* Schema.decodeUnknown(WorkspaceIntegration.patch)(
        patch
      );
      return yield* WorkspaceIntegration._validate({
        ...this,
        ...safePatch,
      });
    });
}
