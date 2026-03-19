import {
  WorkspaceInvitation,
  WorkspaceInvitationRepository,
} from "@mason/core/modules/workspace-invitation";
import { RepositoryError } from "@mason/core/shared/database";
import { Drizzle, schema } from "@mason/db";
import { and, eq, gt } from "drizzle-orm";
import { DateTime, Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const WorkspaceInvitationRepositoryLayer = Layer.effect(
  WorkspaceInvitationRepository,
  Effect.gen(function* () {
    const drizzle = yield* Drizzle;

    const insertWorkspaceInvitation = SqlSchema.findOne({
      Request: WorkspaceInvitation.insert,
      Result: WorkspaceInvitation,
      execute: (data) =>
        drizzle
          .insert(schema.workspaceInvitationsTable)
          .values(data)
          .returning()
          .execute(),
    });

    const updateWorkspaceInvitation = SqlSchema.findOne({
      Request: Schema.Struct({
        workspaceId: WorkspaceInvitation.fields.workspaceId,
        id: WorkspaceInvitation.fields.id,
        update: WorkspaceInvitation.update,
      }),
      Result: WorkspaceInvitation,
      execute: ({ workspaceId, id, update }) =>
        drizzle
          .update(schema.workspaceInvitationsTable)
          .set(update)
          .where(
            and(
              eq(schema.workspaceInvitationsTable.workspaceId, workspaceId),
              eq(schema.workspaceInvitationsTable.id, id)
            )
          )
          .returning()
          .execute(),
    });

    const findWorkspaceInvitationById = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: WorkspaceInvitation.fields.workspaceId,
        id: WorkspaceInvitation.fields.id,
      }),
      Result: WorkspaceInvitation,
      execute: ({ workspaceId, id }) =>
        drizzle
          .select()
          .from(schema.workspaceInvitationsTable)
          .where(
            and(
              eq(schema.workspaceInvitationsTable.workspaceId, workspaceId),
              eq(schema.workspaceInvitationsTable.id, id)
            )
          )
          .execute(),
    });

    const findWorkspaceInvitationByInvitationId = SqlSchema.findOneOption({
      Request: WorkspaceInvitation.fields.id,
      Result: WorkspaceInvitation,
      execute: (id) =>
        drizzle
          .select()
          .from(schema.workspaceInvitationsTable)
          .where(eq(schema.workspaceInvitationsTable.id, id))
          .execute(),
    });

    const findActivePendingWorkspaceInvitationByEmail = SqlSchema.findOneOption(
      {
        Request: Schema.Struct({
          workspaceId: WorkspaceInvitation.fields.workspaceId,
          email: WorkspaceInvitation.fields.email,
        }),
        Result: WorkspaceInvitation,
        execute: ({ workspaceId, email }) =>
          Effect.gen(function* () {
            const now = yield* DateTime.now;

            return yield* drizzle
              .select()
              .from(schema.workspaceInvitationsTable)
              .where(
                and(
                  eq(schema.workspaceInvitationsTable.workspaceId, workspaceId),
                  eq(schema.workspaceInvitationsTable.email, email),
                  eq(schema.workspaceInvitationsTable.status, "pending"),
                  gt(
                    schema.workspaceInvitationsTable.expiresAt,
                    DateTime.toDate(now)
                  )
                )
              )
              .execute();
          }),
      }
    );

    return {
      insert: (data) =>
        insertWorkspaceInvitation(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      update: (params) =>
        updateWorkspaceInvitation(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findById: (params) =>
        findWorkspaceInvitationById(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findByInvitationId: (params) =>
        findWorkspaceInvitationByInvitationId(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findActivePendingByEmail: (data) =>
        findActivePendingWorkspaceInvitationByEmail(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
