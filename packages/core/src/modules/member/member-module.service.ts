import { Context, Effect, Layer } from "effect";
import { MasonError } from "~/shared/errors";
import type {
  AssertUserNotWorkspaceMemberInput,
  AssertUserNotWorkspaceMemberOutput,
} from "./actions/assert-user-not-workspace-member";
import { AssertUserNotWorkspaceMemberAction } from "./actions/assert-user-not-workspace-member";
import type {
  AssertUserWorkspaceMemberInput,
  AssertUserWorkspaceMemberOutput,
} from "./actions/assert-user-workspace-member";
import { AssertUserWorkspaceMemberAction } from "./actions/assert-user-workspace-member";
import type { CreateMemberInput, CreateMemberOutput } from "./actions/create";
import { CreateMemberAction } from "./actions/create";
import type {
  RetrieveMemberInput,
  RetrieveMemberOutput,
} from "./actions/retrieve";
import { RetrieveMemberAction } from "./actions/retrieve";
import type {
  UserAlreadyWorkspaceMemberError,
  UserNotWorkspaceMemberError,
} from "./domain/errors";
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
