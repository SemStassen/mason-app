import { WorkspaceRole } from "@mason/authorization";
import { DateTime, Duration, Effect, Schema } from "effect";
import {
  Email,
  MemberId,
  WorkspaceId,
  WorkspaceInvitationId,
} from "~/shared/schemas";
import { generateUUID, type SchemaFields } from "~/shared/utils";
import {
  WorkspaceInvitationExpiredError,
  WorkspaceInvitationTransitionError,
} from "./errors";

export class WorkspaceInvitation extends Schema.TaggedClass<WorkspaceInvitation>(
  "WorkspaceInvitation"
)(
  "WorkspaceInvitation",
  {
    id: WorkspaceInvitationId,
    // References
    inviterId: MemberId,
    workspaceId: WorkspaceId,
    // General
    email: Email,
    role: WorkspaceRole,
    status: Schema.Literal("pending", "accepted", "rejected", "canceled"),
    expiresAt: Schema.DateTimeUtcFromSelf,
  },
  {
    identifier: "WorkspaceInvitation",
    title: "Workspace Invitation",
    description: "A workspace invitation",
  }
) {
  private static _validate = (
    input: SchemaFields<typeof WorkspaceInvitation>
  ) => Schema.decodeUnknown(WorkspaceInvitation)(input);

  private static _defaultExpiration = DateTime.now.pipe(
    Effect.map((dt) => DateTime.addDuration(dt, Duration.days(30)))
  );

  private static _makeDefaults = Effect.gen(function* () {
    const expiresAt = yield* WorkspaceInvitation._defaultExpiration;

    return {
      status: "pending",
      expiresAt,
    } as const;
  });

  static create = (input: CreateWorkspaceInvitation) =>
    Effect.gen(function* () {
      const defaults = yield* WorkspaceInvitation._makeDefaults;

      const safeInput = yield* Schema.decodeUnknown(CreateWorkspaceInvitation)(
        input
      );

      return yield* WorkspaceInvitation._validate({
        ...defaults,
        ...safeInput,
        id: WorkspaceInvitationId.make(generateUUID()),
        _tag: "WorkspaceInvitation",
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

export type CreateWorkspaceInvitation = typeof CreateWorkspaceInvitation.Type;
export const CreateWorkspaceInvitation = Schema.Struct({
  workspaceId: WorkspaceId,
  inviterId: MemberId,
  email: WorkspaceInvitation.fields.email,
  role: WorkspaceInvitation.fields.role,
});
