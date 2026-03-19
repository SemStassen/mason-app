import {
  WorkspaceMember,
  WorkspaceMemberRepository,
} from "@mason/core/modules/workspace-member";
import { RepositoryError } from "@mason/core/shared/repository";
import { schema } from "@mason/db";
import { and, eq } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

import { Database } from "#shared/database/index";

export const WorkspaceMemberRepositoryLayer = Layer.effect(
  WorkspaceMemberRepository,
  Effect.gen(function* () {
    const { drizzle } = yield* Database;

    const insertWorkspaceMember = SqlSchema.findOne({
      Request: WorkspaceMember.insert,
      Result: WorkspaceMember,
      execute: (data) =>
        drizzle
          .insert(schema.workspaceMembersTable)
          .values(data)
          .returning()
          .execute(),
    });

    const updateWorkspaceMember = SqlSchema.findOne({
      Request: Schema.Struct({
        workspaceId: WorkspaceMember.fields.workspaceId,
        id: WorkspaceMember.fields.id,
        update: WorkspaceMember.update,
      }),
      Result: WorkspaceMember,
      execute: ({ workspaceId, id, update }) =>
        drizzle
          .update(schema.workspaceMembersTable)
          .set(update)
          .where(
            and(
              eq(schema.workspaceMembersTable.workspaceId, workspaceId),
              eq(schema.workspaceMembersTable.id, id)
            )
          )
          .returning()
          .execute(),
    });

    const findWorkspaceMemberById = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: WorkspaceMember.fields.workspaceId,
        id: WorkspaceMember.fields.id,
      }),
      Result: WorkspaceMember,
      execute: ({ workspaceId, id }) =>
        drizzle
          .select()
          .from(schema.workspaceMembersTable)
          .where(
            and(
              eq(schema.workspaceMembersTable.workspaceId, workspaceId),
              eq(schema.workspaceMembersTable.id, id)
            )
          )
          .execute(),
    });

    const findWorkspaceMemberByUserId = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: WorkspaceMember.fields.workspaceId,
        userId: WorkspaceMember.fields.userId,
      }),
      Result: WorkspaceMember,
      execute: ({ workspaceId, userId }) =>
        drizzle
          .select()
          .from(schema.workspaceMembersTable)
          .where(
            and(
              eq(schema.workspaceMembersTable.workspaceId, workspaceId),
              eq(schema.workspaceMembersTable.userId, userId)
            )
          )
          .execute(),
    });

    return {
      insert: (data) =>
        insertWorkspaceMember(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      update: (params) =>
        updateWorkspaceMember(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findById: (params) =>
        findWorkspaceMemberById(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findMembership: (params) =>
        findWorkspaceMemberByUserId(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
