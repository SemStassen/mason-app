import { WorkspaceIntegration } from "@mason/core/modules/integration";
import { RepositoryError } from "@mason/core/shared/repository";
import { schema } from "@mason/db";
import { and, eq } from "drizzle-orm";
import { Effect, Layer, Redacted, Schema, ServiceMap } from "effect";
import type { Option } from "effect";
import { SqlSchema } from "effect/unstable/sql";

import { Database } from "@mason/db";

export interface WorkspaceIntegrationRepositoryShape {
  readonly insert: (
    data: typeof WorkspaceIntegration.insert.Type
  ) => Effect.Effect<WorkspaceIntegration, RepositoryError>;
  readonly update: (params: {
    workspaceId: WorkspaceIntegration["workspaceId"];
    id: WorkspaceIntegration["id"];
    update: typeof WorkspaceIntegration.update.Type;
  }) => Effect.Effect<WorkspaceIntegration, RepositoryError>;
  readonly hardDelete: (params: {
    workspaceId: WorkspaceIntegration["workspaceId"];
    id: WorkspaceIntegration["id"];
  }) => Effect.Effect<void, RepositoryError>;
  readonly findById: (params: {
    workspaceId: WorkspaceIntegration["workspaceId"];
    id: WorkspaceIntegration["id"];
  }) => Effect.Effect<Option.Option<WorkspaceIntegration>, RepositoryError>;
  readonly findByProvider: (params: {
    workspaceId: WorkspaceIntegration["workspaceId"];
    provider: WorkspaceIntegration["provider"];
  }) => Effect.Effect<Option.Option<WorkspaceIntegration>, RepositoryError>;
}

export class WorkspaceIntegrationRepository extends ServiceMap.Service<
  WorkspaceIntegrationRepository,
  WorkspaceIntegrationRepositoryShape
>()("@mason/integration/WorkspaceIntegrationRepository") {
  static readonly layer = Layer.effect(
    WorkspaceIntegrationRepository,
    Effect.gen(function* () {
      const { drizzle } = yield* Database;

      const insertWorkspaceIntegration = SqlSchema.findOne({
        Request: WorkspaceIntegration.insert,
        Result: WorkspaceIntegration,
        execute: (data) =>
          drizzle
            .insert(schema.workspaceIntegrationsTable)
            .values({
              ...data,
              encryptedApiKey: Redacted.value(data.apiKey),
            })
            .returning()
            .execute(),
      });

      const updateWorkspaceIntegration = SqlSchema.findOne({
        Request: Schema.Struct({
          workspaceId: WorkspaceIntegration.fields.workspaceId,
          id: WorkspaceIntegration.fields.id,
          update: WorkspaceIntegration.update,
        }),
        Result: WorkspaceIntegration,
        execute: ({ workspaceId, id, update }) =>
          drizzle
            .update(schema.workspaceIntegrationsTable)
            .set({
              ...update,
              ...(update.apiKey
                ? { encryptedApiKey: Redacted.value(update.apiKey) }
                : {}),
            })
            .where(
              and(
                eq(schema.workspaceIntegrationsTable.workspaceId, workspaceId),
                eq(schema.workspaceIntegrationsTable.id, id)
              )
            )
            .returning()
            .execute(),
      });

      const hardDeleteWorkspaceIntegration = SqlSchema.findOneOption({
        Request: Schema.Struct({
          workspaceId: WorkspaceIntegration.fields.workspaceId,
          id: WorkspaceIntegration.fields.id,
        }),
        Result: Schema.Void,
        execute: ({ workspaceId, id }) =>
          drizzle
            .delete(schema.workspaceIntegrationsTable)
            .where(
              and(
                eq(schema.workspaceIntegrationsTable.workspaceId, workspaceId),
                eq(schema.workspaceIntegrationsTable.id, id)
              )
            )
            .execute(),
      });

      const findWorkspaceIntegrationById = SqlSchema.findOneOption({
        Request: Schema.Struct({
          workspaceId: WorkspaceIntegration.fields.workspaceId,
          id: WorkspaceIntegration.fields.id,
        }),
        Result: WorkspaceIntegration,
        execute: ({ workspaceId, id }) =>
          drizzle
            .select()
            .from(schema.workspaceIntegrationsTable)
            .where(
              and(
                eq(schema.workspaceIntegrationsTable.workspaceId, workspaceId),
                eq(schema.workspaceIntegrationsTable.id, id)
              )
            )
            .execute(),
      });

      const findWorkspaceIntegrationByProvider = SqlSchema.findOneOption({
        Request: Schema.Struct({
          workspaceId: WorkspaceIntegration.fields.workspaceId,
          provider: WorkspaceIntegration.fields.provider,
        }),
        Result: WorkspaceIntegration,
        execute: ({ workspaceId, provider }) =>
          drizzle
            .select()
            .from(schema.workspaceIntegrationsTable)
            .where(
              and(
                eq(schema.workspaceIntegrationsTable.workspaceId, workspaceId),
                eq(schema.workspaceIntegrationsTable.provider, provider)
              )
            )
            .execute(),
      });

      return {
        insert: (data) =>
          insertWorkspaceIntegration(data).pipe(
            Effect.mapError((e) => new RepositoryError({ cause: e }))
          ),
        update: (params) =>
          updateWorkspaceIntegration(params).pipe(
            Effect.mapError((e) => new RepositoryError({ cause: e }))
          ),
        hardDelete: (params) =>
          hardDeleteWorkspaceIntegration(params).pipe(
            Effect.mapError((e) => new RepositoryError({ cause: e }))
          ),
        findById: (params) =>
          findWorkspaceIntegrationById(params).pipe(
            Effect.mapError((e) => new RepositoryError({ cause: e }))
          ),
        findByProvider: (params) =>
          findWorkspaceIntegrationByProvider(params).pipe(
            Effect.mapError((e) => new RepositoryError({ cause: e }))
          ),
      };
    })
  );
}

// export const WorkspaceIntegrationRepositoryLayer = Layer.effect(
//   WorkspaceIntegrationRepository,
//   Effect.gen(function* () {
//     const drizzle = yield* Drizzle;

//     const insertWorkspaceIntegration = SqlSchema.findOne({
//       Request: WorkspaceIntegration.insert,
//       Result: WorkspaceIntegration,
//       execute: (data) =>
//         drizzle
//           .insert(schema.workspaceIntegrationsTable)
//           .values({
//             ...data,
//             encryptedApiKey: Redacted.value(data.apiKey),
//           })
//           .returning(),
//     });

//     const updateWorkspaceIntegration = SqlSchema.findOne({
//       Request: Schema.Struct({
//         workspaceId: WorkspaceIntegration.fields.workspaceId,
//         id: WorkspaceIntegration.fields.id,
//         update: WorkspaceIntegration.update,
//       }),
//       Result: WorkspaceIntegration,
//       execute: ({ workspaceId, id, update }) =>
//         drizzle
//           .update(schema.workspaceIntegrationsTable)
//           .set({
//             ...update,
//             ...(update.apiKey
//               ? { encryptedApiKey: Redacted.value(update.apiKey) }
//               : {}),
//           })
//           .where(
//             and(
//               eq(schema.workspaceIntegrationsTable.workspaceId, workspaceId),
//               eq(schema.workspaceIntegrationsTable.id, id)
//             )
//           )
//           .returning(),
//     });

//     const hardDeleteWorkspaceIntegration = SqlSchema.findOneOption({
//       Request: Schema.Struct({
//         workspaceId: WorkspaceIntegration.fields.workspaceId,
//         id: WorkspaceIntegration.fields.id,
//       }),
//       Result: Schema.Void,
//       execute: ({ workspaceId, id }) =>
//         drizzle
//           .delete(schema.workspaceIntegrationsTable)
//           .where(
//             and(
//               eq(schema.workspaceIntegrationsTable.workspaceId, workspaceId),
//               eq(schema.workspaceIntegrationsTable.id, id)
//             )
//           ),
//     });

//     const findWorkspaceIntegrationById = SqlSchema.findOneOption({
//       Request: Schema.Struct({
//         workspaceId: WorkspaceIntegration.fields.workspaceId,
//         id: WorkspaceIntegration.fields.id,
//       }),
//       Result: WorkspaceIntegration,
//       execute: ({ workspaceId, id }) =>
//         drizzle
//           .select()
//           .from(schema.workspaceIntegrationsTable)
//           .where(
//             and(
//               eq(schema.workspaceIntegrationsTable.workspaceId, workspaceId),
//               eq(schema.workspaceIntegrationsTable.id, id)
//             )
//           ),
//     });

//     const findWorkspaceIntegrationByProvider = SqlSchema.findOneOption({
//       Request: Schema.Struct({
//         workspaceId: WorkspaceIntegration.fields.workspaceId,
//         provider: WorkspaceIntegration.fields.provider,
//       }),
//       Result: WorkspaceIntegration,
//       execute: ({ workspaceId, provider }) =>
//         drizzle
//           .select()
//           .from(schema.workspaceIntegrationsTable)
//           .where(
//             and(
//               eq(schema.workspaceIntegrationsTable.workspaceId, workspaceId),
//               eq(schema.workspaceIntegrationsTable.provider, provider)
//             )
//           ),
//     });

//     return {
//       insert: (data) =>
//         insertWorkspaceIntegration(data).pipe(
//           Effect.mapError((e) => new RepositoryError({ cause: e }))
//         ),
//       update: (params) =>
//         updateWorkspaceIntegration(params).pipe(
//           Effect.mapError((e) => new RepositoryError({ cause: e }))
//         ),
//       hardDelete: (params) =>
//         hardDeleteWorkspaceIntegration(params).pipe(
//           Effect.mapError((e) => new RepositoryError({ cause: e }))
//         ),
//       findById: (params) =>
//         findWorkspaceIntegrationById(params).pipe(
//           Effect.mapError((e) => new RepositoryError({ cause: e }))
//         ),
//       findByProvider: (params) =>
//         findWorkspaceIntegrationByProvider(params).pipe(
//           Effect.mapError((e) => new RepositoryError({ cause: e }))
//         ),
//     };
//   })
// );
