import { WorkspaceRole } from "@mason/authorization";
import { Effect, Option, Schema } from "effect";
import { MemberId, Model, UserId, WorkspaceId } from "~/shared/schemas";
import {
  isDeleted as checkIsDeleted,
  generateUUID,
  restore,
  softDelete,
} from "~/shared/utils";

export class Member extends Model.Class<Member>("Member")(
  {
    id: Model.DomainManaged(MemberId),
    userId: Model.SystemImmutable(UserId),
    workspaceId: Model.SystemImmutable(WorkspaceId),
    role: Model.Mutable(WorkspaceRole),
    deletedAt: Model.DomainManaged(
      Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf)
    ),
  },
  {
    identifier: "Member",
    title: "Member",
    description: "A member of a workspace",
  }
) {
  private static _validate = (input: typeof Member.model.Type) =>
    Schema.validate(Member)(input);

  static fromInput = (input: typeof Member.create.Type) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(Member.create)(input);

      return yield* Member._validate({
        ...safeInput,
        id: MemberId.make(generateUUID()),
        deletedAt: Option.none(),
      });
    });

  patch = (patch: typeof Member.patch.Type) =>
    Effect.gen(this, function* () {
      const safePatch = yield* Schema.decodeUnknown(Member.patch)(patch);

      return yield* Member._validate({
        ...this,
        ...safePatch,
      });
    });

  softDelete = () => softDelete(this, Member._validate);

  restore = () => restore(this, Member._validate);

  /** Predicates */

  isDeleted = () => checkIsDeleted(this);
}
