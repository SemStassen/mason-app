import { Effect } from "effect";
import { Member } from "../domain/member.model";
import { MemberRepository } from "../repositories/member.repo";
import { AssertUserNotWorkspaceMemberAction } from "./assert-user-not-workspace-member";

export type CreateMemberInput = typeof Member.create.Type;

export type CreateMemberOutput = void;

export const CreateMemberAction = Effect.fn("member/CreateMemberAction")(
  function* (input: CreateMemberInput) {
    const memberRepo = yield* MemberRepository;

    yield* AssertUserNotWorkspaceMemberAction({
      userId: input.userId,
      workspaceId: input.workspaceId,
    });

    const createdMember = yield* Member.fromInput(input);

    yield* memberRepo.insert({
      members: [createdMember],
    });
  }
);
