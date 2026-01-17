import { Effect, Option } from "effect";
import type { UserId, WorkspaceId } from "~/shared/schemas";
import { UserNotWorkspaceMemberError } from "../domain";
import { MemberRepository } from "../repositories";

export interface AssertUserWorkspaceMemberInput {
  userId: UserId;
  workspaceId: WorkspaceId;
}

export type AssertUserWorkspaceMemberOutput = void;

export const AssertUserWorkspaceMemberAction = Effect.fn(
  "member/AssertUserWorkspaceMember"
)(function* (input: AssertUserWorkspaceMemberInput) {
  const memberRepo = yield* MemberRepository;

  const maybeMember = yield* memberRepo.retrieve({
    workspaceId: input.workspaceId,
    query: {
      userId: input.userId,
    },
  });

  if (Option.isNone(maybeMember)) {
    return yield* Effect.fail(new UserNotWorkspaceMemberError());
  }
});
