import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/shared/errors";
import type { MemberId, WorkspaceId } from "~/shared/schemas";
import type { Member } from "../schemas/member.model";

export class MemberRepository extends Context.Tag(
  "@mason/member/MemberRepository"
)<
  MemberRepository,
  {
    insert: (params: {
      workspaceId: WorkspaceId;
      members: NonEmptyReadonlyArray<Member>;
    }) => Effect.Effect<ReadonlyArray<Member>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      members: NonEmptyReadonlyArray<Member>;
    }) => Effect.Effect<ReadonlyArray<Member>, DatabaseError>;
    softDelete: (params: {
      workspaceId: WorkspaceId;
      memberIds: NonEmptyReadonlyArray<MemberId>;
    }) => Effect.Effect<void, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      memberId: MemberId;
    }) => Effect.Effect<Option.Option<Member>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query: {
        ids?: ReadonlyArray<MemberId>;
      };
    }) => Effect.Effect<ReadonlyArray<Member>, DatabaseError>;
  }
>() {}
