import { Effect } from "effect";
import { type CreateMember, Member } from "../domain";
import { MemberRepository } from "../repositories";
import { AssertUserNotWorkspaceMemberAction } from "./assert-user-not-workspace-member";

export type CreateMemberInput = CreateMember;

export type CreateMemberOutput = void;

export const CreateMemberAction = Effect.fn("member/CreateMemberAction")(
  function* (input: CreateMemberInput) {
    const memberRepo = yield* MemberRepository;

    yield* AssertUserNotWorkspaceMemberAction({
      userId: input.userId,
      workspaceId: input.workspaceId,
    });

    const createdMember = yield* Member.create(input);

    yield* memberRepo.insert({
      members: [createdMember],
    });
  }
);
