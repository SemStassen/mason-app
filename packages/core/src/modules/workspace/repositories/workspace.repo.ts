import { DrizzleService } from "@mason/db";
import { Effect } from "effect";
import { SqlModel, SqlSchema } from "effect/unstable/sql";
import { Workspace } from "../domain/workspace.entity";

// const WorkspaceSelect = createSelectSchema(schema.workspacesTable);
// type WorkspaceSelect = typeof WorkspaceSelect.Type;

const WorkspaceRepository = SqlModel.makeRepository(Workspace, {
  tableName: "workspaces",
  spanPrefix: "workspace",
  idColumn: "id",
}).pipe(
  Effect.flatMap((repository) =>
    Effect.gen(function* () {
      const drizzle = yield* DrizzleService;

      const findBySlugSchema = SqlSchema.findOne({
        Request: Workspace.fields.slug,

        Result: Workspace,
        execute: (slug) =>
          drizzle.query.workspacesTable.findMany({
            where: {
              slug: slug,
            },
          }),
      });

      return {
        ...repository,
        findBySlug: (slug: typeof Workspace.fields.slug.Type) =>
          findBySlugSchema(slug).pipe(
            Effect.withSpan(
              "workspace.findBySlug",
              { attributes: { slug } },
              { captureStackTrace: false }
            )
          ),
      };
    })
  )
);

export { WorkspaceRepository };

// const rowToWorkspace = (row: WorkspaceSelect): Workspace =>
//   Schema.decodeUnknownSync(Workspace)({
//     id: row.id,
//     name: row.name,
//     slug: row.slug,
//     logoUrl: Option.fromNullable(row.logoUrl),
//     metadata: Option.fromNullable(row.metadata),
//   });

// const workspaceToDb = (workspace: typeof Workspace.entity.Encoded) => ({
//   id: workspace.id,
//   name: workspace.name,
//   slug: workspace.slug,
//   logoUrl: Option.getOrNull(workspace.logoUrl),
//   metadata: Option.getOrNull(workspace.metadata),
// });

// export class WorkspaceRepository extends ServiceMap.Service<WorkspaceRepository>()(
//   "@mason/workspace/WorkspaceRepository",
//   { make: Effect.gen(function* () {
//     const drizzle = yield* DrizzleService;

//     return {
//       retrieveBySlug: Effect.fn("workspace/retrieveBySlug")(function* ( slug: typeof Workspace.Type["slug"]) {
//         const maybeRow = yield* drizzle.query.workspacesTable.findFirst({
//           where: {
//             slug: {
//               eq: slug,
//             }
//           }
//         })

//         return Option.map(maybeRow, rowToWorkspace);
//       }),
//     }
//   }) },
// ) {}
