import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import type { MemberId, UserId, WorkspaceId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import type { Member } from "../domain/member.model";

export class MemberRepository extends Context.Tag(
  "@mason/member/MemberRepository"
)<
  MemberRepository,
  {
    insert: (params: {
      members: NonEmptyReadonlyArray<Member>;
    }) => Effect.Effect<ReadonlyArray<Member>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      members: NonEmptyReadonlyArray<Member>;
    }) => Effect.Effect<ReadonlyArray<Member>, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query: AtLeastOne<{
        id: MemberId;
        userId: UserId;
      }>;
    }) => Effect.Effect<Option.Option<Member>, DatabaseError>;
  }
>() {}
