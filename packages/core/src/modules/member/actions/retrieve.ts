import { Effect, type Option } from "effect";
import type { MemberId, UserId, WorkspaceId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import type { Member } from "../domain/member.model";
import { MemberRepository } from "../repositories/member.repo";

export interface RetrieveMemberInput {
  workspaceId: WorkspaceId;
  query: AtLeastOne<{
    id: MemberId;
    userId: UserId;
  }>;
}

export type RetrieveMemberOutput = Option.Option<Member>;

export const RetrieveMemberAction = Effect.fn("member/RetrieveMemberAction")(
  function* (input: RetrieveMemberInput) {
    const memberRepo = yield* MemberRepository;

    const maybeMember = yield* memberRepo.retrieve({
      workspaceId: input.workspaceId,
      query: input.query,
    });

    return maybeMember;
  }
);
