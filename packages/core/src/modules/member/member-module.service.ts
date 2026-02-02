import { Context, Effect, Layer } from "effect";
import { MasonError } from "~/shared/errors";
import {
  AssertUserNotWorkspaceMemberAction,
  type AssertUserNotWorkspaceMemberInput,
  type AssertUserNotWorkspaceMemberOutput,
  AssertUserWorkspaceMemberAction,
  type AssertUserWorkspaceMemberInput,
  type AssertUserWorkspaceMemberOutput,
  CreateMemberAction,
  type CreateMemberInput,
  type CreateMemberOutput,
  RetrieveMemberAction,
  type RetrieveMemberInput,
  type RetrieveMemberOutput,
} from "./actions";
import type {
  UserAlreadyWorkspaceMemberError,
  UserNotWorkspaceMemberError,
} from "./domain";
import { MemberRepository } from "./repositories/member.repo";

export class MemberModuleService extends Context.Tag(
  "@mason/member/MemberModuleService"
)<
  MemberModuleService,
  {
    createMember: (
      params: CreateMemberInput
    ) => Effect.Effect<
      CreateMemberOutput,
      UserAlreadyWorkspaceMemberError | MasonError
    >;
    assertUserNotWorkspaceMember: (
      params: AssertUserNotWorkspaceMemberInput
    ) => Effect.Effect<
      AssertUserNotWorkspaceMemberOutput,
      UserAlreadyWorkspaceMemberError | MasonError
    >;
    assertUserWorkspaceMember: (
      params: AssertUserWorkspaceMemberInput
    ) => Effect.Effect<
      AssertUserWorkspaceMemberOutput,
      UserNotWorkspaceMemberError | MasonError
    >;
    retrieveMember: (
      params: RetrieveMemberInput
    ) => Effect.Effect<RetrieveMemberOutput, MasonError>;
  }
>() {
  static readonly live = Layer.effect(
    MemberModuleService,
    Effect.gen(function* () {
      const memberRepo = yield* MemberRepository;

      const services = Context.make(MemberRepository, memberRepo);

      return MemberModuleService.of({
        createMember: (params) =>
          CreateMemberAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        assertUserNotWorkspaceMember: (params) =>
          AssertUserNotWorkspaceMemberAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        assertUserWorkspaceMember: (params) =>
          AssertUserWorkspaceMemberAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        retrieveMember: (params) =>
          RetrieveMemberAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),
      });
    })
  );
}
