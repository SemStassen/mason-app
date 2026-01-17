import { WorkspaceRole } from "@mason/authorization";
import { Effect, Option, Schema } from "effect";
import { MemberId, UserId, WorkspaceId } from "~/shared/schemas";
import {
  isDeleted as checkIsDeleted,
  generateUUID,
  restore,
  type SchemaFields,
  softDelete,
} from "~/shared/utils";

export class Member extends Schema.TaggedClass<Member>("Member")(
  "Member",
  {
    id: MemberId,
    userId: UserId,
    workspaceId: WorkspaceId,
    role: WorkspaceRole,
    deletedAt: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
  },
  {
    identifier: "Member",
    title: "Member",
    description: "A member of a workspace",
  }
) {
  private static _validate = (input: SchemaFields<typeof Member>) =>
    Schema.decodeUnknown(Member)(input);

  private static _defaults = {
    deletedAt: Option.none(),
  };

  static create = (input: CreateMember) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(CreateMember)(input);

      return yield* Member._validate({
        ...Member._defaults,
        ...safeInput,
        id: MemberId.make(generateUUID()),
        _tag: "Member",
      });
    });

  patch = (input: PatchMember) =>
    Effect.gen(this, function* () {
      const safeInput = yield* Schema.decodeUnknown(PatchMember)(input);

      return yield* Member._validate({
        ...this,
        ...safeInput,
      });
    });

  softDelete = () => softDelete(this, Member._validate);

  restore = () => restore(this, Member._validate);

  /** Predicates */

  isDeleted = () => checkIsDeleted(this);
}

export type CreateMember = typeof CreateMember.Type;
export const CreateMember = Schema.Struct({
  userId: UserId,
  workspaceId: WorkspaceId,
  role: WorkspaceRole,
});

export type PatchMember = typeof PatchMember.Type;
export const PatchMember = Schema.Struct({
  role: WorkspaceRole,
});
