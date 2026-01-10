import { Array, Context, Effect, Layer, Option } from "effect";
import {
  type AuthorizationError,
  AuthorizationService,
} from "~/infra/authorization";
import type { MemberId, UserId, WorkspaceId } from "~/shared/schemas";
import { MemberDomainError, MemberFns } from "./internal";
import { MemberRepository } from "./repositories/member.repo";
import type { CreateMemberCommand, PatchMemberCommand } from "./schemas";
import type { Member } from "./schemas/member.model";

export class MemberDomainService extends Context.Tag(
  "@mason/member/MemberDomainService"
)<
  MemberDomainService,
  {
    makeMember: (params: {
      command: CreateMemberCommand;
    }) => Effect.Effect<Member, MemberDomainError>;
    patchMember: (params: {
      existing: Member;
      command: PatchMemberCommand;
    }) => Effect.Effect<Member, MemberDomainError>;
    markMemberAsDeleted: (params: {
      existing: Member;
    }) => Effect.Effect<Member, MemberDomainError>;
    saveMembers: (params: {
      workspaceId: WorkspaceId;
      existing: ReadonlyArray<Member>;
    }) => Effect.Effect<void, AuthorizationError | MemberDomainError>;
    retrieveMember: (params: {
      workspaceId: WorkspaceId;
      query?: {
        id?: MemberId;
        userId?: UserId;
      };
    }) => Effect.Effect<
      Option.Option<Member>,
      AuthorizationError | MemberDomainError
    >;
    listMembers: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: ReadonlyArray<MemberId>;
      };
    }) => Effect.Effect<
      ReadonlyArray<Member>,
      AuthorizationError | MemberDomainError
    >;
  }
>() {
  static readonly live = Layer.effect(
    MemberDomainService,
    Effect.gen(function* () {
      const authorization = yield* AuthorizationService;
      const memberRepo = yield* MemberRepository;

      return MemberDomainService.of({
        makeMember: ({ command }) => MemberFns.create(command),

        patchMember: ({ existing, command }) =>
          MemberFns.patch(existing, command),

        markMemberAsDeleted: ({ existing }) => MemberFns.softDelete(existing),

        saveMembers: Effect.fn("member/MemberDomainService.saveMembers")(
          function* ({ workspaceId, existing }) {
            if (Array.isNonEmptyReadonlyArray(existing)) {
              yield* authorization.ensureWorkspaceMatches({
                workspaceId,
                model: existing,
              });

              yield* memberRepo.upsert({ workspaceId, members: existing });
            }
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new MemberDomainError({ cause: e })),
          })
        ),

        retrieveMember: Effect.fn("member/MemberDomainService.retrieveMember")(
          function* ({ workspaceId, query }) {
            const member = yield* memberRepo.retrieve({
              workspaceId,
              query: { ...query },
            });

            if (Option.isSome(member)) {
              yield* authorization.ensureWorkspaceMatches({
                workspaceId,
                model: [member.value],
              });
            }

            return member;
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new MemberDomainError({ cause: e })),
          })
        ),
        listMembers: Effect.fn("member/MemberDomainService.listMembers")(
          function* ({ workspaceId, query }) {
            const members = yield* memberRepo.list({
              workspaceId,
              query: { ...query },
            });

            yield* authorization.ensureWorkspaceMatches({
              workspaceId,
              model: members,
            });

            return members;
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new MemberDomainError({ cause: e })),
          })
        ),
      });
    })
  );
}
