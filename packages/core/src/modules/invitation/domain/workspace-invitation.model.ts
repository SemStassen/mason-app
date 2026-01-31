import { WorkspaceRole } from "@mason/authorization";
import { DateTime, Duration, Effect, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";
import {
  Email,
  MemberId,
  Model,
  WorkspaceId,
  WorkspaceInvitationId,
} from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import { assert, assertEffect } from "~/shared/utils/assert";
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
  static validate = (input: typeof WorkspaceInvitation.model.Type) =>
    Schema.validate(WorkspaceInvitation)(input);

  static defaultExpiration = DateTime.now.pipe(
    Effect.map((dt) => DateTime.addDuration(dt, Duration.days(30)))
  );
}

const assertPending: (
  self: WorkspaceInvitation
) => Effect.Effect<void, WorkspaceInvitationTransitionError> = (self) =>
  assert(
    self.status === "pending",
    new WorkspaceInvitationTransitionError({
      cause: "Workspace invitation is not pending",
    })
  );

const assertNotExpired: (
  self: WorkspaceInvitation
) => Effect.Effect<void, WorkspaceInvitationExpiredError> = (self) =>
  assertEffect(
    DateTime.isFuture(self.expiresAt),
    new WorkspaceInvitationExpiredError({
      cause: "Workspace invitation has expired",
    })
  );

const makeWorkspaceInvitation = (
  input: typeof WorkspaceInvitation.create.Type
) =>
  Effect.gen(function* () {
    const safeInput = yield* Schema.decodeUnknown(WorkspaceInvitation.create)(
      input
    );

    const expiresAt = yield* WorkspaceInvitation.defaultExpiration;

    return yield* WorkspaceInvitation.validate({
      id: WorkspaceInvitationId.make(generateUUID()),
      status: "pending",
      expiresAt: expiresAt,
      ...safeInput,
    });
  });

const changeWorkspaceInvitationStatus: (
  self: WorkspaceInvitation,
  status: WorkspaceInvitation["status"]
) => Effect.Effect<
  WorkspaceInvitation,
  | ParseError
  | WorkspaceInvitationTransitionError
  | WorkspaceInvitationExpiredError,
  never
> = (self, status) =>
  Effect.gen(function* () {
    yield* assertPending(self);
    yield* assertNotExpired(self);

    return yield* WorkspaceInvitation.validate({ ...self, status });
  });

const renewWorkspaceInvitation: (
  self: WorkspaceInvitation
) => Effect.Effect<
  WorkspaceInvitation,
  | ParseError
  | WorkspaceInvitationTransitionError
  | WorkspaceInvitationExpiredError,
  never
> = (self) =>
  Effect.gen(function* () {
    yield* assertPending(self);
    yield* assertNotExpired(self);

    const expiresAt = yield* WorkspaceInvitation.defaultExpiration;

    return yield* WorkspaceInvitation.validate({
      ...self,
      expiresAt: expiresAt,
    });
  });

export {
  makeWorkspaceInvitation,
  changeWorkspaceInvitationStatus,
  renewWorkspaceInvitation,
};
