import { Effect, Option } from "effect";
import type { UserId, WorkspaceId } from "~/shared/schemas";
import { UserAlreadyWorkspaceMemberError } from "../domain/errors";
import { MemberRepository } from "../repositories";

export interface AssertUserNotWorkspaceMemberInput {
  userId: UserId;
  workspaceId: WorkspaceId;
}

export type AssertUserNotWorkspaceMemberOutput = void;

export const AssertUserNotWorkspaceMemberAction = Effect.fn(
  "member/AssertUserNotWorkspaceMemberAction"
)(function* (input: AssertUserNotWorkspaceMemberInput) {
  const memberRepo = yield* MemberRepository;

  const maybeMember = yield* memberRepo.retrieve({
    workspaceId: input.workspaceId,
    query: {
      userId: input.userId,
    },
  });

  if (Option.isSome(maybeMember)) {
    return yield* Effect.fail(new UserAlreadyWorkspaceMemberError());
  }
});
