import { Effect, Option, Schema } from "effect";
import { Model, SessionId, UserId, WorkspaceId } from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";

export class Session extends Model.Class<Session>("Session")(
  {
    id: Model.DomainManaged(SessionId),
    userId: Model.SystemImmutable(UserId),
    activeWorkspaceId: Model.Mutable(Schema.OptionFromSelf(WorkspaceId)),
  },
  {
    identifier: "Session",
    title: "Session",
    description: "A session",
  }
) {
  private static _validate = (input: typeof Session.entity.Type) =>
    Schema.validate(Session)(input);

  static fromInput = (input: typeof Session.actionCreate.Type) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(Session.actionCreate)(input);

      return yield* Session._validate({
        id: SessionId.make(generateUUID()),
        ...safeInput,
      });
    });

  patch = (patch: typeof Session.actionPatch.Type) =>
    Effect.gen(this, function* () {
      const safePatch = yield* Schema.decodeUnknown(Session.actionPatch)(patch);

      return yield* Session._validate({
        ...this,
        ...safePatch,
      });
    });

  setActiveWorkspace = (workspaceId: Session["activeWorkspaceId"]) =>
    Effect.gen(this, function* () {
      return yield* Session._validate({
        ...this,
        activeWorkspaceId: Option.some(workspaceId),
      });
    });
}
