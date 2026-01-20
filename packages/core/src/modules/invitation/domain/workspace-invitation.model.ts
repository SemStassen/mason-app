import { WorkspaceRole } from "@mason/authorization";
import { DateTime, Duration, Effect, Schema } from "effect";
import {
  Email,
  MemberId,
  Model,
  WorkspaceId,
  WorkspaceInvitationId,
} from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import {
  WorkspaceInvitationExpiredError,
  WorkspaceInvitationTransitionError,
} from "./errors";

export class WorkspaceInvitation extends Model.Class<WorkspaceInvitation>(
  "WorkspaceInvitation"
)(
  {
    id: Model.DomainManaged(WorkspaceInvitationId),
    inviterId: Model.SystemImmutable(MemberId),
    workspaceId: Model.SystemImmutable(WorkspaceId),
    email: Model.UserImmutable(Email),
    role: Model.UserImmutable(WorkspaceRole),
    status: Model.DomainManaged(
      Schema.Literal("pending", "accepted", "rejected", "canceled")
    ),
    expiresAt: Model.DomainManaged(Schema.DateTimeUtcFromSelf),
  },
  {
    identifier: "WorkspaceInvitation",
    title: "Workspace Invitation",
    description: "A workspace invitation",
  }
) {
  private static _validate = (input: typeof WorkspaceInvitation.model.Type) =>
    Schema.validate(WorkspaceInvitation)(input);

  private static _defaultExpiration = DateTime.now.pipe(
    Effect.map((dt) => DateTime.addDuration(dt, Duration.days(30)))
  );

  private static _makeDefaults = Effect.gen(function* () {
    const expiresAt = yield* WorkspaceInvitation._defaultExpiration;

    return {
      status: "pending" as const,
      expiresAt,
    };
  });

  static fromInput = (input: typeof WorkspaceInvitation.create.Type) =>
    Effect.gen(function* () {
      const defaults = yield* WorkspaceInvitation._makeDefaults;

      const safeInput = yield* Schema.decodeUnknown(WorkspaceInvitation.create)(
        input
      );

      return yield* WorkspaceInvitation._validate({
        ...defaults,
        id: WorkspaceInvitationId.make(generateUUID()),
        ...safeInput,
      });
    });

  changeStatus = (status: WorkspaceInvitation["status"]) =>
    Effect.gen(this, function* () {
      yield* this.assertNotExpired();
      yield* this.assertPending();

      return yield* WorkspaceInvitation._validate({
        ...this,
        status,
      });
    });

  renew = () =>
    Effect.gen(this, function* () {
      yield* this.assertNotExpired();
      yield* this.assertPending();

      const expiresAt = yield* WorkspaceInvitation._defaultExpiration;

      return yield* WorkspaceInvitation._validate({
        ...this,
        expiresAt,
      });
    });

  /** Predicates */

  private readonly isPending = () => this.status === "pending";

  private readonly isExpiredEffect = () => DateTime.isPast(this.expiresAt);

  /** Assertions */

  private readonly assertNotExpired = () =>
    this.isExpiredEffect().pipe(
      Effect.filterOrFail(
        (expired) => !expired,
        () =>
          new WorkspaceInvitationExpiredError({
            cause: "Workspace invitation has expired",
          })
      ),
      Effect.asVoid
    );

  private readonly assertPending = () =>
    this.isPending()
      ? Effect.void
      : Effect.fail(
          new WorkspaceInvitationTransitionError({
            cause: "Workspace invitation is not pending",
          })
        );
}
