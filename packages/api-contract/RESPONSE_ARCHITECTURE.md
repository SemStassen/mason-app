# API Response Architecture

## Current State

### Problem: Duplication & Drift

**Domain Models** (`packages/core/modules/{module}/src/{entity}.model.ts`):
- Use branded types: `ExistingProjectId`, `ExistingWorkspaceId`
- Use `DateTime.Utc` for temporal data
- Include internal fields: `deletedAt`
- Rich domain types: `HexColor`, `JsonRecord`

**API Contract** (`packages/api-contract/src/dto/{entity}.dto.ts`):
- Duplicates schema definitions
- Uses plain `Schema.NonEmptyString` (not branded)
- Uses `Schema.DateFromSelf` (not DateTime)
- Excludes internal fields like `deletedAt`
- Different structure for optional fields

**Mapping** (`apps/server/src/api/handlers/{entity}.ts`):
- Uses `{Response}.make(domainModel)` to convert
- Risk of schema drift between domain and API

## Recommended Approach: API Contract as Source of Truth

### Principle: API Contract Defines What Goes Out

The API contract should be the **stable, versioned interface** that clients depend on. Domain models are internal and can evolve independently.

### Structure

```
packages/api-contract/src/dto/{entity}.dto.ts
├── {Entity}Response          # What clients receive (stable)
├── Create{Entity}Request     # What clients send
└── Update{Entity}Request    # What clients send

packages/core/modules/{module}/src/{entity}.model.ts
├── {Entity}                  # Internal domain model (can change)
├── create{Entity}            # Domain creation logic
└── update{Entity}            # Domain update logic

packages/core/modules/{module}/src/{entity}.mapper.ts  # NEW
└── to{Entity}Response        # Explicit domain → API mapping
```

### Benefits

1. **API Stability**: Contract changes are explicit and versioned
2. **Domain Freedom**: Internal models can evolve without breaking API
3. **Type Safety**: Explicit mapping catches mismatches at compile time
4. **Clear Boundaries**: Separation of concerns (domain vs API)

### Implementation Pattern

```typescript
// packages/api-contract/src/dto/project.dto.ts
export const ProjectResponse = Schema.TaggedStruct("ProjectResponse", {
  id: Schema.NonEmptyString,
  workspaceId: Schema.NonEmptyString,
  name: Schema.NonEmptyString,
  hexColor: Schema.NonEmptyString,
  isBillable: Schema.Boolean,
  startDate: Schema.NullOr(Schema.DateFromSelf),
  endDate: Schema.NullOr(Schema.DateFromSelf),
  notes: Schema.NullOr(JsonRecord),
  _metadata: Schema.NullOr(
    Schema.Struct({
      source: Schema.optional(Schema.Literal("float")),
      externalId: Schema.optional(Schema.String),
    })
  ),
  // Note: deletedAt is NOT in response (internal only)
});

// packages/core/modules/project/src/project.mapper.ts
import { Project } from "./project.model";
import { ProjectResponse } from "@mason/api-contract/dto/project.dto";
import { DateTime } from "effect";

export const toProjectResponse = (project: Project): typeof ProjectResponse.Type =>
  ProjectResponse.make({
    id: project.id,
    workspaceId: project.workspaceId,
    name: project.name,
    hexColor: project.hexColor,
    isBillable: project.isBillable,
    startDate: project.startDate ? DateTime.toDate(project.startDate) : null,
    endDate: project.endDate ? DateTime.toDate(project.endDate) : null,
    notes: project.notes,
    _metadata: project._metadata,
    // deletedAt is intentionally omitted
  });

// apps/server/src/api/handlers/project.ts
import { toProjectResponse } from "@mason/project/project.mapper";

return projects.map(toProjectResponse);
```

## Alternative: Domain as Source of Truth

If you prefer domain-driven approach:

```typescript
// packages/core/modules/project/src/project.model.ts
export const Project = Schema.TaggedStruct("Project", {
  // ... domain model
});

// packages/api-contract/src/dto/project.dto.ts
import { Project } from "@mason/project/project.model";
import { Schema } from "effect";

// Derive API response from domain model
export const ProjectResponse = Project.pipe(
  Schema.omit("deletedAt"), // Remove internal fields
  Schema.transform(
    // Transform DateTime → Date for API
    Schema.Struct({
      ...Project.fields,
      startDate: Schema.NullOr(Schema.DateFromSelf),
      endDate: Schema.NullOr(Schema.DateFromSelf),
    }),
    (domain) => ({
      ...domain,
      startDate: domain.startDate ? DateTime.toDate(domain.startDate) : null,
      endDate: domain.endDate ? DateTime.toDate(domain.endDate) : null,
    }),
    (api) => ({
      ...api,
      startDate: api.startDate ? DateTime.fromDate(api.startDate) : null,
      endDate: api.endDate ? DateTime.fromDate(api.endDate) : null,
    })
  )
);
```

### Trade-offs

**Domain as Source:**
- ✅ Single source of truth
- ✅ Automatic sync (can't drift)
- ❌ API tied to domain changes
- ❌ Harder to version API independently

**API Contract as Source:**
- ✅ API stability & versioning
- ✅ Domain can evolve freely
- ✅ Clear API boundaries
- ❌ Requires explicit mapping
- ❌ Potential for drift (mitigated by tests)

## Recommendation

**Use API Contract as Source of Truth** because:

1. **API Versioning**: You can version your API contract independently
2. **Client Stability**: Clients depend on API contract, not domain
3. **Evolution**: Domain can change without breaking API
4. **Explicit Mapping**: Makes transformations visible and testable

### Migration Path

1. Keep current structure (it works)
2. Add explicit mapper functions in modules
3. Gradually move to mapper pattern
4. Add tests to prevent drift

### Example Mapper Module

```typescript
// packages/core/modules/project/src/project.mapper.ts
import { Project } from "./project.model";
import { Task } from "./task.model";
import { ProjectResponse, TaskResponse } from "@mason/api-contract/dto";
import { DateTime } from "effect";

export const toProjectResponse = (project: Project): typeof ProjectResponse.Type =>
  ProjectResponse.make({
    id: project.id,
    workspaceId: project.workspaceId,
    name: project.name,
    hexColor: project.hexColor,
    isBillable: project.isBillable,
    startDate: project.startDate ? DateTime.toDate(project.startDate) : null,
    endDate: project.endDate ? DateTime.toDate(project.endDate) : null,
    notes: project.notes,
    _metadata: project._metadata,
  });

export const toTaskResponse = (task: Task): typeof TaskResponse.Type =>
  TaskResponse.make({
    id: task.id,
    workspaceId: task.workspaceId,
    projectId: task.projectId,
    name: task.name,
    _metadata: task._metadata,
  });
```

## Summary

**Current**: Domain models → API contract (via `.make()`)
**Recommended**: API contract defines responses, explicit mappers convert domain → API

This keeps your API stable while allowing domain models to evolve independently.

