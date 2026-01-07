import { Context, Effect, Layer, type Option } from "effect";
import { AuthorizationService } from "~/application/authorization";
import type { AuthorizationError } from "~/shared/errors/authorization";
import type { MemberId, WorkspaceId } from "~/shared/schemas";
import { processArray } from "~/shared/utils";
import { MemberDomainError, MemberFns, MemberNotFoundError } from "./internal";
import { MemberRepository } from "./repositories/member.repo";
import type {
  CreateMemberCommand,
  UpdateMemberCommand,
} from "./schemas/commands";
import type { Member } from "./schemas/member.model";

export class MemberDomainService extends Context.Tag(
  "@mason/member/MemberDomainService"
)<
  MemberDomainService,
  {
    createMembers: (params: {
      workspaceId: WorkspaceId;
      commands: ReadonlyArray<CreateMemberCommand>;
    }) => Effect.Effect<ReadonlyArray<Member>, MemberDomainError>;
    updateMembers: (params: {
      workspaceId: WorkspaceId;
      commands: ReadonlyArray<UpdateMemberCommand>;
    }) => Effect.Effect<
      ReadonlyArray<Member>,
      AuthorizationError | MemberDomainError | MemberNotFoundError
    >;
    softDeleteMembers: (params: {
      workspaceId: WorkspaceId;
      memberIds: ReadonlyArray<MemberId>;
    }) => Effect.Effect<
      void,
      AuthorizationError | MemberDomainError | MemberNotFoundError
    >;
    retrieveMember: (params: {
      workspaceId: WorkspaceId;
      memberId: MemberId;
    }) => Effect.Effect<Option.Option<Member>, MemberDomainError>;
    listMembers: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: ReadonlyArray<MemberId>;
      };
    }) => Effect.Effect<ReadonlyArray<Member>, MemberDomainError>;
  }
>() {
  static readonly live = Layer.effect(
    MemberDomainService,
    Effect.gen(function* () {
      const authorization = yield* AuthorizationService;
      const memberRepo = yield* MemberRepository;

      return MemberDomainService.of({
        createMembers: Effect.fn("member/MemberDomainService.createMembers")(
          ({ workspaceId, commands }) =>
            processArray({
              items: commands,
              onEmpty: Effect.succeed([]),
              mapItem: (member) => MemberFns.create(member, { workspaceId }),
              execute: (members) => memberRepo.insert({ workspaceId, members }),
            }).pipe(
              Effect.catchTags({
                "shared/DatabaseError": (e) =>
                  Effect.fail(new MemberDomainError({ cause: e })),
                ParseError: (e) =>
                  Effect.fail(new MemberDomainError({ cause: e })),
              })
            )
        ),
        updateMembers: Effect.fn("member/MemberDomainService.updateMembers")(
          ({ workspaceId, commands }) =>
            processArray({
              items: commands,
              onEmpty: Effect.succeed([]),
              prepare: (updates) =>
                Effect.gen(function* () {
                  const existingMembers = yield* memberRepo.list({
                    workspaceId,
                    query: { ids: updates.map((m) => m.memberId) },
                  });

                  yield* authorization.ensureWorkspaceMatches({
                    workspaceId,
                    model: existingMembers,
                  });

                  return new Map(existingMembers.map((e) => [e.id, e]));
                }),
              mapItem: (update, existingMap) =>
                Effect.gen(function* () {
                  const existing = existingMap.get(update.memberId);

                  if (!existing) {
                    return yield* Effect.fail(new MemberNotFoundError());
                  }
                  return yield* MemberFns.update(existing, update);
                }),
              execute: (membersToUpdate) =>
                memberRepo.update({ workspaceId, members: membersToUpdate }),
            }).pipe(
              Effect.catchTags({
                "shared/DatabaseError": (e) =>
                  Effect.fail(new MemberDomainError({ cause: e })),
                ParseError: (e) =>
                  Effect.fail(new MemberDomainError({ cause: e })),
              })
            )
        ),
        softDeleteMembers: Effect.fn(
          "member/MemberDomainService.softDeleteMembers"
        )(({ workspaceId, memberIds }) =>
          processArray({
            items: memberIds,
            onEmpty: Effect.void,
            prepare: (memberIds) =>
              Effect.gen(function* () {
                const existingMembers = yield* memberRepo.list({
                  workspaceId,
                  query: { ids: memberIds },
                });

                yield* authorization.ensureWorkspaceMatches({
                  workspaceId,
                  model: existingMembers,
                });

                return new Map(existingMembers.map((e) => [e.id, e]));
              }),
            mapItem: (memberId, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(memberId);

                if (!existing) {
                  return yield* Effect.fail(new MemberNotFoundError());
                }

                return yield* MemberFns.softDelete(existing).pipe(
                  Effect.map((m) => m.id)
                );
              }),
            execute: (memberIdsToSoftDelete) =>
              memberRepo.softDelete({
                workspaceId,
                memberIds: memberIdsToSoftDelete,
              }),
          }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new MemberDomainError({ cause: e })),
              ParseError: (e) =>
                Effect.fail(new MemberDomainError({ cause: e })),
            })
          )
        ),
        retrieveMember: Effect.fn("member/MemberDomainService.retrieveMember")(
          ({ workspaceId, memberId }) =>
            memberRepo.retrieve({ workspaceId, memberId }).pipe(
              Effect.catchTags({
                "shared/DatabaseError": (e) =>
                  Effect.fail(new MemberDomainError({ cause: e })),
              })
            )
        ),
        listMembers: Effect.fn("member/MemberDomainService.listMembers")(
          ({ workspaceId, query }) =>
            memberRepo
              .list({
                workspaceId,
                query: { ...query },
              })
              .pipe(
                Effect.catchTags({
                  "shared/DatabaseError": (e) =>
                    Effect.fail(new MemberDomainError({ cause: e })),
                })
              )
        ),
      });
    })
  );
}
