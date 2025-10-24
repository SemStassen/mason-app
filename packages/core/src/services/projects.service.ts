import { and, eq, inArray, sql } from "@mason/db/operators";
import { type DbProject, projectsTable } from "@mason/db/schema";
import { Effect, Schema } from "effect";
import { ProjectId, type WorkspaceId } from "../models/ids";
import {
  Project,
  type ProjectToCreate,
  type ProjectToUpdate,
} from "../models/project.model";
import { createDomainEntities, updateDomainEntities } from "./crud-helpers";
import { DatabaseService } from "./db.service";

export class ProjectsService extends Effect.Service<ProjectsService>()(
  "@mason/core/projectsService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DatabaseService;

      const createProjects = ({
        workspaceId,
        projects,
      }: {
        workspaceId: typeof WorkspaceId.Type;
        projects: Array<typeof ProjectToCreate.Type>;
      }) =>
        createDomainEntities({
          entityName: "Project",
          inputs: projects,
          toDomain: (input) => Project.makeFromCreate(input, workspaceId),
          saveBatch: (entities) =>
            db.use(workspaceId, (conn) =>
              conn.insert(projectsTable).values(entities).returning()
            ),
          fromDb: (dbRecord) => Project.makeFromDb(dbRecord),
        });

      const updateProjects = ({
        workspaceId,
        projects,
      }: {
        workspaceId: typeof WorkspaceId.Type;
        projects: Array<typeof ProjectToUpdate.Type>;
      }) =>
        updateDomainEntities({
          entityName: "Project",
          inputs: projects,
          fetchExisting: (ids) =>
            db.use(workspaceId, (conn) =>
              conn.query.projectsTable.findMany({
                where: ({ id }) => inArray(id, ids),
              })
            ),
          toDomain: (update, existing) =>
            Project.makeFromUpdate(update, existing),
          fromDb: (dbRecord) => Project.makeFromDb(dbRecord),
          saveUpdates: (entities) =>
            db.withTransaction(
              Effect.gen(function* () {
                const results: Array<DbProject> = [];

                for (const entity of entities) {
                  const [updated] = yield* db.use(workspaceId, (conn) =>
                    conn
                      .update(projectsTable)
                      .set(entity)
                      .where(
                        and(
                          eq(projectsTable.workspaceId, workspaceId),
                          eq(projectsTable.id, entity.id)
                        )
                      )
                      .returning()
                  );
                  results.push(updated);
                }

                return results;
              })
            ),
        });

      return {
        createProjects: createProjects,
        updateProjects: updateProjects,
        softDeleteProjects: ({
          workspaceId,
          projectIds,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          projectIds: Array<typeof ProjectId.Type>;
        }) =>
          Effect.gen(function* () {
            if (!projectIds.length) {
              yield* Effect.logDebug("softDeleteProjects: 0 supplied");
              return [];
            }

            return yield* db.use(workspaceId, (conn) =>
              conn
                .update(projectsTable)
                .set({ deletedAt: new Date() })
                .where(
                  and(
                    eq(projectsTable.workspaceId, workspaceId),
                    inArray(projectsTable.id, projectIds)
                  )
                )
            );
          }),
        hardDeleteProjects: ({
          workspaceId,
          projectIds,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          projectIds: Array<typeof ProjectId.Type>;
        }) =>
          Effect.gen(function* () {
            if (!projectIds.length) {
              yield* Effect.logDebug("hardDeleteProjects: 0 supplied");
              return [];
            }

            return yield* db.use(workspaceId, (conn) =>
              conn
                .delete(projectsTable)
                .where(
                  and(
                    eq(projectsTable.workspaceId, workspaceId),
                    inArray(projectsTable.id, projectIds)
                  )
                )
            );
          }),
        listProjects: ({
          workspaceId,
          query,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          query?: {
            ids?: Array<typeof ProjectId.Type>;
            _source?: "float";
            _externalIds?: Array<string>;
          };
        }) =>
          Effect.gen(function* () {
            const whereConditions = [
              eq(projectsTable.workspaceId, workspaceId),
              query?.ids ? inArray(projectsTable.id, query.ids) : undefined,
              query?._source
                ? and(
                    sql`${projectsTable._metadata}->>'source' = ${query._source}`,
                    sql`${projectsTable._metadata}->>'externalId' IS NOT NULL`
                  )
                : undefined,
              query?._externalIds?.length
                ? sql`${projectsTable._metadata}->>'externalId' IN (${sql.join(
                    query._externalIds.map((id) => sql`${id}`),
                    sql`, `
                  )})`
                : undefined,
            ].filter(Boolean);

            const projects = yield* db.use(workspaceId, (conn) =>
              conn.query.projectsTable.findMany({
                where: and(...whereConditions),
              })
            );

            return projects.map((p) =>
              Schema.decodeUnknownSync(Project)({
                ...p,
                id: ProjectId.make(p.id),
                workspaceId: workspaceId,
              })
            );
          }),
      };
    }),
  }
) {}
