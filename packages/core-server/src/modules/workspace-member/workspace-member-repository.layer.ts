import {
  WorkspaceMember,
  WorkspaceMemberRepository,
} from "@recount/core/modules/workspace-member";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { and, eq } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const WorkspaceMemberRepositoryLayer = Layer.effect(
  WorkspaceMemberRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const insertWorkspaceMember = SqlSchema.findOne({
      Request: WorkspaceMember.insert,
      Result: WorkspaceMember,
      execute: (data) =>
        db.drizzle((drizzle) =>
          drizzle
            .insert(schema.workspaceMembersTable)
            .values(data)
            .returning()
            .execute()
        ),
    });

    const updateWorkspaceMember = SqlSchema.findOne({
      Request: Schema.Struct({
        workspaceId: WorkspaceMember.fields.workspaceId,
        id: WorkspaceMember.fields.id,
        update: WorkspaceMember.update,
      }),
      Result: WorkspaceMember,
      execute: ({ workspaceId, id, update }) =>
        db.drizzle((drizzle) =>
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
            .execute()
        ),
    });

    const findWorkspaceMemberById = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: WorkspaceMember.fields.workspaceId,
        id: WorkspaceMember.fields.id,
      }),
      Result: WorkspaceMember,
      execute: ({ workspaceId, id }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.workspaceMembersTable)
            .where(
              and(
                eq(schema.workspaceMembersTable.workspaceId, workspaceId),
                eq(schema.workspaceMembersTable.id, id)
              )
            )
            .execute()
        ),
    });

    const findWorkspaceMemberByUserId = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: WorkspaceMember.fields.workspaceId,
        userId: WorkspaceMember.fields.userId,
      }),
      Result: WorkspaceMember,
      execute: ({ workspaceId, userId }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.workspaceMembersTable)
            .where(
              and(
                eq(schema.workspaceMembersTable.workspaceId, workspaceId),
                eq(schema.workspaceMembersTable.userId, userId)
              )
            )
            .execute()
        ),
    });

    const listWorkspaceMembersByUserId = SqlSchema.findAll({
      Request: WorkspaceMember.fields.userId,
      Result: WorkspaceMember,
      execute: (userId) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.workspaceMembersTable)
            .where(eq(schema.workspaceMembersTable.userId, userId))
            .execute()
        ),
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
      listByUserId: (userId) =>
        listWorkspaceMembersByUserId(userId).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
