# Module Structure Guide

This guide documents the standard structure and patterns for creating new modules in the Mason codebase.

## File Structure

Each module follows a flat structure with these core files:

```
packages/core/modules/{module-name}/src/
├── {entity}.model.ts              # Domain model (Schema, create, update, softDelete)
├── {entity}.repo.ts               # Repository (database operations)
├── {module}-module.service.ts     # Service (orchestration & business logic)
├── dto.ts                         # Data Transfer Objects
├── errors.ts                      # Error types
├── index.ts                       # Public API exports
└── package.json
```

## Naming Conventions

### Files

- **Models**: `{entity}.model.ts` (e.g., `time-entry.model.ts`, `project.model.ts`)
- **Repositories**: `{entity}.repo.ts` (e.g., `time-entry.repo.ts`, `project.repo.ts`)
- **Services**: `{module}-module.service.ts` (e.g., `time-tracking-module.service.ts`, `project-module.service.ts`)
- **DTOs**: `dto.ts` (or `{module}.dto.ts` if multiple entities)
- **Errors**: `errors.ts` (or `{entity}.errors.ts` for domain-specific)

### Classes

- **Service**: `{Module}ModuleService` (e.g., `TimeTrackingModuleService`, `ProjectModuleService`)
- **Repository**: `{Entity}Repository` (e.g., `TimeEntryRepository`, `ProjectRepository`)
- **Errors**: `Internal{Module}ModuleError`, `{Entity}NotFoundError`

## Module Types

### Single Entity Module

Example: `time-tracking` module

```
src/
├── time-entry.model.ts
├── time-entry.repo.ts
├── time-tracking-module.service.ts
├── dto.ts
├── errors.ts
└── index.ts
```

**Service Interface:**

```typescript
export class TimeTrackingModuleService extends Context.Tag(
  "@mason/time-tracking/TimeTrackingModuleService"
)<
  TimeTrackingModuleService,
  {
    create{Entity}s: (params: {...}) => Effect.Effect<...>;
    update{Entity}s: (params: {...}) => Effect.Effect<...>;
    softDelete{Entity}s: (params: {...}) => Effect.Effect<void, ...>;
    hardDelete{Entity}s: (params: {...}) => Effect.Effect<void, ...>;
    list{Entity}s: (params: {...}) => Effect.Effect<...>;
  }
>()
```

### Multiple Entity Module

Example: `project` module (Project + Task)

```
src/
├── project.model.ts
├── project.repo.ts
├── task.model.ts
├── task.repo.ts
├── project-module.service.ts
├── dto.ts
├── errors.ts
└── index.ts
```

**Service Interface:**

```typescript
export class ProjectModuleService extends Context.Tag(
  "@mason/project/ProjectModuleService"
)<
  ProjectModuleService,
  {
    // Project methods
    createProjects: (params: {...}) => Effect.Effect<...>;
    updateProjects: (params: {...}) => Effect.Effect<...>;
    // ... other project methods

    // Task methods
    createTasks: (params: {...}) => Effect.Effect<...>;
    updateTasks: (params: {...}) => Effect.Effect<...>;
    // ... other task methods
  }
>()
```

## File Templates

### Model File (`{entity}.model.ts`)

```typescript
import { Existing{Entity}Id, ExistingWorkspaceId, generateUUID } from "@mason/framework";
import { DateTime, Effect, Schema } from "effect";
import { dual } from "effect/Function";
import type { ParseError } from "effect/ParseResult";

// =============================================================================
// Schema
// =============================================================================

const {Entity}Base = Schema.TaggedStruct("{Entity}", {
  id: Existing{Entity}Id,
  workspaceId: ExistingWorkspaceId,
  // ... other fields
  deletedAt: Schema.NullOr(Schema.DateTimeUtcFromSelf),
});

export const {Entity} = {Entity}Base.pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "{Entity}",
    title: "{Entity}",
    description: "...",
  })
);

export type {Entity} = Schema.Schema.Type<typeof {Entity}>;

// =============================================================================
// Creation
// =============================================================================

export const Create{Entity} = Schema.Struct({
  workspaceId: {Entity}Base.fields.workspaceId,
  // ... required fields
});

export const create{Entity} = (
  input: typeof Create{Entity}.Type
): Effect.Effect<{Entity}, ParseError> =>
  Schema.decodeUnknown(Create{Entity})(input).pipe(
    Effect.flatMap((validated) =>
      Schema.decodeUnknown({Entity})({
        ...validated,
        id: Existing{Entity}Id.make(generateUUID()),
        deletedAt: null,
      })
    )
  );

// =============================================================================
// Updates
// =============================================================================

export const Patch{Entity} = Schema.Struct({
  // ... optional fields
});

export const update{Entity} = dual<
  (updates: typeof Patch{Entity}.Type) => (self: {Entity}) => Effect.Effect<{Entity}, ParseError>,
  (self: {Entity}, updates: typeof Patch{Entity}.Type) => Effect.Effect<{Entity}, ParseError>
>(2, (self, updates) =>
  Schema.decodeUnknown(Patch{Entity})(updates).pipe(
    Effect.flatMap((validated) =>
      Schema.decodeUnknown({Entity})({
        ...self,
        ...validated,
      })
    )
  )
);

// =============================================================================
// Soft Delete
// =============================================================================

export const softDelete{Entity} = (self: {Entity}): Effect.Effect<{Entity}> =>
  Effect.gen(function* () {
    if (self.deletedAt) {
      return self;
    }
    const deletedAt = yield* DateTime.now;
    return { ...self, deletedAt };
  });
```

### Repository File (`{entity}.repo.ts`)

```typescript
import { SqlSchema } from "@effect/sql";
import { and, eq, inArray, isNotNull } from "@mason/db/operators";
import { type Db{Entity}, {entity}sTable } from "@mason/db/schema";
import { DatabaseService } from "@mason/db/service";
import {
  DatabaseError,
  Existing{Entity}Id,
  ExistingWorkspaceId,
  {Entity}Id,
} from "@mason/framework";
import { Context, DateTime, Effect, Layer, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import { {Entity} } from "./{entity}.model";

const _mapToDb = (
  {entity}: typeof {Entity}.Encoded
): Omit<Db{Entity}, "createdAt" | "updatedAt"> => {
  return {
    id: {entity}.id,
    workspaceId: {entity}.workspaceId,
    // ... map all fields
    deletedAt: {entity}.deletedAt ? DateTime.toDate({entity}.deletedAt) : null,
  };
};

export class {Entity}Repository extends Context.Tag(
  "@mason/{module}/{Entity}Repository"
)<
  {Entity}Repository,
  {
    insert: (
      {entity}s: NonEmptyReadonlyArray<{Entity}>
    ) => Effect.Effect<ReadonlyArray<{Entity}>, DatabaseError>;
    update: (
      {entity}s: NonEmptyReadonlyArray<{Entity}>
    ) => Effect.Effect<ReadonlyArray<{Entity}>, DatabaseError>;
    hardDelete: (
      {entity}Ids: NonEmptyReadonlyArray<Existing{Entity}Id>
    ) => Effect.Effect<void, DatabaseError>;
    list: (params: {
      workspaceId: ExistingWorkspaceId;
      query?: {
        ids?: ReadonlyArray<{Entity}Id>;
        // ... other query params
        _includeDeleted?: boolean;
      };
    }) => Effect.Effect<ReadonlyArray<{Entity}>, DatabaseError>;
  }
>() {
  static readonly live = Layer.effect(
    {Entity}Repository,
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      // --- Mutations / Commands ---
      const Insert{Entity}s = SqlSchema.findAll({
        Request: Schema.NonEmptyArray({Entity}),
        Result: {Entity},
        execute: ({entity}s) =>
          db.drizzle
            .insert({entity}sTable)
            .values({entity}s.map(_mapToDb))
            .returning(),
      });

      const Update{Entity}s = SqlSchema.findAll({
        Request: Schema.NonEmptyArray({Entity}),
        Result: {Entity},
        execute: ({entity}s) =>
          Effect.forEach(
            {entity}s,
            ({entity}) =>
              db.drizzle
                .update({entity}sTable)
                .set(_mapToDb({entity}))
                .where(eq({entity}sTable.id, {entity}.id))
                .returning(),
            { concurrency: 5 }
          ).pipe(Effect.map((r) => r.flat())),
      });

      const HardDelete{Entity}s = SqlSchema.void({
        Request: Schema.NonEmptyArray(Existing{Entity}Id),
        execute: ({entity}Ids) =>
          db.drizzle
            .delete({entity}sTable)
            .where(inArray({entity}sTable.id, {entity}Ids)),
      });

      // --- Queries ---
      const List{Entity}s = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: ExistingWorkspaceId,
          query: Schema.optional(
            Schema.Struct({
              ids: Schema.optional(Schema.Array({Entity}Id)),
              _includeDeleted: Schema.optional(Schema.Boolean),
            })
          ),
        }),
        Result: {Entity},
        execute: ({ workspaceId, query }) => {
          const whereConditions = [
            eq({entity}sTable.workspaceId, workspaceId),
            query?.ids ? inArray({entity}sTable.id, query.ids) : undefined,
            query?._includeDeleted
              ? undefined
              : isNotNull({entity}sTable.deletedAt),
          ].filter(Boolean);

          return db.drizzle.query.{entity}sTable.findMany({
            where: and(...whereConditions),
          });
        },
      });

      return {Entity}Repository.of({
        insert: Effect.fn("@mason/{module}/{Entity}Repo.insert")(
          ({entity}s) =>
            Insert{Entity}s({entity}s).pipe(
              Effect.mapError((e) => new DatabaseError({ cause: e }))
            )
        ),

        update: Effect.fn("@mason/{module}/{Entity}Repo.update")(
          ({entity}s) =>
            Update{Entity}s({entity}s).pipe(
              Effect.mapError((e) => new DatabaseError({ cause: e }))
            )
        ),

        hardDelete: Effect.fn("@mason/{module}/{Entity}Repo.hardDelete")(
          ({entity}Ids) =>
            HardDelete{Entity}s({entity}Ids).pipe(
              Effect.mapError((e) => new DatabaseError({ cause: e }))
            )
        ),

        list: Effect.fn("@mason/{module}/{Entity}Repo.list")(
          (params) =>
            List{Entity}s(params).pipe(
              Effect.mapError((e) => new DatabaseError({ cause: e }))
            )
        ),
      });
    })
  );
}
```

### Service File (`{module}-module.service.ts`)

```typescript
import {
  Existing{Entity}Id,
  ExistingWorkspaceId,
  processArray,
  {Entity}Id,
} from "@mason/framework";
import { Context, Effect, Layer } from "effect";
import type { ParseError } from "effect/ParseResult";
import type { {Entity}ToCreateDTO, {Entity}ToUpdateDTO } from "./dto";
import {
  Internal{Module}ModuleError,
  {Entity}NotFoundError,
} from "./errors";
import {
  create{Entity},
  softDelete{Entity},
  {Entity},
  update{Entity},
} from "./{entity}.model";
import { {Entity}Repository } from "./{entity}.repo";

export class {Module}ModuleService extends Context.Tag(
  "@mason/{module}/{Module}ModuleService"
)<
  {Module}ModuleService,
  {
    create{Entity}s: (params: {
      workspaceId: ExistingWorkspaceId;
      {entity}s: ReadonlyArray<{Entity}ToCreateDTO>;
    }) => Effect.Effect<
      ReadonlyArray<{Entity}>,
      Internal{Module}ModuleError
    >;
    update{Entity}s: (params: {
      workspaceId: ExistingWorkspaceId;
      {entity}s: ReadonlyArray<{Entity}ToUpdateDTO>;
    }) => Effect.Effect<
      ReadonlyArray<{Entity}>,
      Internal{Module}ModuleError | {Entity}NotFoundError
    >;
    softDelete{Entity}s: (params: {
      workspaceId: ExistingWorkspaceId;
      {entity}Ids: ReadonlyArray<{Entity}Id>;
    }) => Effect.Effect<void, Internal{Module}ModuleError>;
    hardDelete{Entity}s: (params: {
      workspaceId: ExistingWorkspaceId;
      {entity}Ids: ReadonlyArray<{Entity}Id>;
    }) => Effect.Effect<void, Internal{Module}ModuleError>;
    list{Entity}s: (params: {
      workspaceId: ExistingWorkspaceId;
      query?: {
        ids?: Array<{Entity}Id>;
        // ... other query params
      };
    }) => Effect.Effect<
      ReadonlyArray<{Entity}>,
      Internal{Module}ModuleError
    >;
  }
>() {
  static readonly live = Layer.effect(
    {Module}ModuleService,
    Effect.gen(function* () {
      const {entity}Repo = yield* {Entity}Repository;

      return {Module}ModuleService.of({
        create{Entity}s: Effect.fn(
          "@mason/{module}/{Module}ModuleService.create{Entity}s"
        )(({ workspaceId, {entity}s }) =>
          processArray({
            items: {entity}s,
            onEmpty: Effect.succeed([]),
            execute: (nea) =>
              Effect.gen(function* () {
                const {entity}sToCreate = yield* Effect.forEach(nea, ({entity}) =>
                  create{Entity}({
                    ...{entity},
                    workspaceId: ExistingWorkspaceId.make(workspaceId),
                  })
                );

                return yield* {entity}Repo.insert({entity}sToCreate);
              }),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new Internal{Module}ModuleError({ cause: e })),
              ParseError: (e: ParseError) =>
                Effect.fail(new Internal{Module}ModuleError({ cause: e })),
            })
          )
        ),

        update{Entity}s: Effect.fn(
          "@mason/{module}/{Module}ModuleService.update{Entity}s"
        )(({ workspaceId, {entity}s }) =>
          processArray({
            items: {entity}s,
            onEmpty: Effect.succeed([]),
            prepare: (updates) =>
              Effect.gen(function* () {
                const existing{Entity}s = yield* {entity}Repo.list({
                  workspaceId,
                  query: { ids: updates.map((u) => u.id) },
                });
                return new Map(
                  existing{Entity}s.map((e) => [{Entity}Id.make(e.id), e])
                );
              }),
            mapItem: (update, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(update.id);
                if (!existing) {
                  return yield* Effect.fail(
                    new {Entity}NotFoundError({ {entity}Id: update.id })
                  );
                }
                const { id, ...patchData } = update;
                return yield* update{Entity}(existing, patchData);
              }),
            execute: ({entity}sToUpdate) => {entity}Repo.update({entity}sToUpdate),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new Internal{Module}ModuleError({ cause: e })),
              ParseError: (e: ParseError) =>
                Effect.fail(new Internal{Module}ModuleError({ cause: e })),
            })
          )
        ),

        softDelete{Entity}s: Effect.fn(
          "@mason/{module}/{Module}ModuleService.softDelete{Entity}s"
        )(({ workspaceId, {entity}Ids }) =>
          processArray({
            items: {entity}Ids,
            schema: {Entity}Id,
            onEmpty: Effect.void,
            execute: (nea) =>
              Effect.gen(function* () {
                const existing{Entity}s = yield* {entity}Repo.list({
                  workspaceId,
                  query: { ids: nea },
                });

                const deleted{Entity}s = yield* Effect.forEach(
                  existing{Entity}s,
                  softDelete{Entity}
                );

                yield* processArray({
                  items: deleted{Entity}s,
                  schema: {Entity},
                  onEmpty: Effect.void,
                  execute: (nea) => {entity}Repo.update(nea).pipe(Effect.asVoid),
                });
              }),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new Internal{Module}ModuleError({ cause: e })),
              ParseError: (e: ParseError) =>
                Effect.fail(new Internal{Module}ModuleError({ cause: e })),
            })
          )
        ),

        hardDelete{Entity}s: Effect.fn(
          "@mason/{module}/{Module}ModuleService.hardDelete{Entity}s"
        )(({ workspaceId, {entity}Ids }) =>
          processArray({
            items: {entity}Ids,
            schema: {Entity}Id,
            onEmpty: Effect.void,
            execute: (nea) =>
              Effect.gen(function* () {
                const existing{Entity}s = yield* {entity}Repo.list({
                  workspaceId,
                  query: { ids: nea },
                });

                yield* processArray({
                  items: existing{Entity}s.map((existing) => existing.id),
                  schema: Existing{Entity}Id,
                  onEmpty: Effect.void,
                  execute: (nea) => {entity}Repo.hardDelete(nea),
                });
              }),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new Internal{Module}ModuleError({ cause: e })),
              ParseError: (e: ParseError) =>
                Effect.fail(new Internal{Module}ModuleError({ cause: e })),
            })
          )
        ),

        list{Entity}s: Effect.fn(
          "@mason/{module}/{Module}ModuleService.list{Entity}s"
        )((params) =>
          {entity}Repo.list(params).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new Internal{Module}ModuleError({ cause: e })),
            })
          )
        ),
      });
    })
  );
}
```

### DTO File (`dto.ts`)

```typescript
import type { {Entity}Id } from "@mason/framework";
import type {
  Create{Entity},
  Patch{Entity},
} from "./{entity}.model";

export interface {Entity}ToCreateDTO {
  // Map from Create{Entity} fields
  field: typeof Create{Entity}.Type.field;
  // ... other fields
}

export interface {Entity}ToUpdateDTO {
  id: {Entity}Id;
  // Map from Patch{Entity} fields (all optional)
  field?: typeof Patch{Entity}.Type.field;
  // ... other fields
}
```

### Errors File (`errors.ts`)

```typescript
import { {Entity}Id } from "@mason/framework";
import { Schema } from "effect";

export class Internal{Module}ModuleError extends Schema.TaggedError<Internal{Module}ModuleError>()(
  "{module}/Internal{Module}ModuleError",
  {
    cause: Schema.Unknown,
  }
) {}

export class {Entity}NotFoundError extends Schema.TaggedError<{Entity}NotFoundError>()(
  "{module}/{Entity}NotFoundError",
  {
    {entity}Id: {Entity}Id,
  }
) {}
```

### Index File (`index.ts`)

```typescript
import { Layer } from "effect";
import { {Entity}Repository } from "./{entity}.repo";
import { {Module}ModuleService } from "./{module}-module.service";

export * from "./dto";
export * from "./errors";
export { {Module}ModuleService } from "./{module}-module.service";

export const {Module}ModuleLive = {Module}ModuleService.live.pipe(
  Layer.provide({Entity}Repository.live)
);
```

## Patterns & Best Practices

### 1. Error Handling

- Always wrap repository calls with `Effect.catchTags` to map `DatabaseError` to module errors
- Use typed `ParseError: (e: ParseError)` in catchTags
- Use `processArray` for batch operations

### 2. Service Methods

- Use `Effect.fn` with descriptive names: `"@mason/{module}/{Module}ModuleService.{methodName}"`
- Always include `workspaceId` in params for multi-tenancy
- Use `processArray` for batch operations with `onEmpty`, `prepare`, `mapItem`, `execute`

### 3. Repository Methods

- Use `Effect.fn` with names: `"@mason/{module}/{Entity}Repo.{methodName}"`
- Always map errors to `DatabaseError`
- Use `SqlSchema.findAll` for batch operations
- Use `SqlSchema.findOne` for single-item queries (returns `Option`)

### 4. Model Functions

- Use `dual` for update functions to support both curried and uncurried forms
- Always validate with Schema before creating/updating
- Use `generateUUID()` for IDs
- Set `deletedAt: null` on creation

### 5. Soft Delete Pattern

- Check if already deleted before setting `deletedAt`
- Use `DateTime.now` for timestamp
- Return the entity with updated `deletedAt`

## Checklist for New Module

- [ ] Create model file with Schema, Create, Patch, update, softDelete
- [ ] Create repository with insert, update, hardDelete, list methods
- [ ] Create service with create, update, softDelete, hardDelete, list methods
- [ ] Create DTO interfaces mapping from Create/Patch schemas
- [ ] Create error classes (Internal{Module}ModuleError, {Entity}NotFoundError)
- [ ] Create index.ts with exports and Layer composition
- [ ] Use consistent naming: `{entity}.model.ts`, `{entity}.repo.ts`, `{module}-module.service.ts`
- [ ] All Effect.fn calls have proper namespaced names
- [ ] All error handling uses catchTags with typed ParseError
- [ ] All batch operations use processArray

## Examples

See existing modules for reference:

- **Single entity**: `packages/core/modules/time-tracking/`
- **Multiple entities**: `packages/core/modules/project/`
- **Special case (API key handling)**: `packages/core/modules/integration/`
