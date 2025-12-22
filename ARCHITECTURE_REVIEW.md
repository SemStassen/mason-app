# Architecture Review & Improvement Plan

## Critical Issues (Fix First)

### 1. Fix TimeEntry Domain Model

- [ ] Make `stoppedAt` optional to support running time entries
- [ ] Add typed validation errors for business rules
- [ ] Add domain methods: `stop()`, `resume()`, `isRunning()`

### 2. Define Aggregate Boundaries

- [ ] Make `Project` an aggregate root
- [ ] Move `Task` operations under `Project` aggregate
- [ ] Enforce aggregate-level invariants

### 3. Improve Error Handling

- [ ] Create specific domain error types
- [ ] Map infrastructure errors at repository boundary
- [ ] Remove generic error types

### 4. Fix Repository Pattern

- [ ] Add persistence model layer (DB ↔ Domain mapping)
- [ ] Add standard repository methods (`findById`, `exists`, `count`)
- [ ] Keep workspace isolation at infrastructure layer

## High Priority

### 5. Add Domain Logic to Services

- [ ] Move business rules from services to domain models
- [ ] Add domain services for complex operations
- [ ] Enforce invariants (overlapping entries, limits, etc.)

### 6. Create Value Objects

- [ ] `TimeRange` value object
- [ ] `Duration` value object
- [ ] `HexColor` value object
- [ ] Extract reusable domain primitives

### 7. Improve Effect-TS Usage

- [ ] Use `Clock` service instead of `new Date()`
- [ ] Add tracing with `Effect.withSpan`
- [ ] Add retry policies for external calls

## Medium Priority

### 8. Add Domain Events

- [ ] Emit events on aggregate state changes
- [ ] Use Effect's `PubSub` or custom event bus
- [ ] Add integration events for cross-module communication

### 9. Refactor Core Flows

- [ ] Extract sync strategies to domain services
- [ ] Improve testability with dependency injection
- [ ] Separate infrastructure from domain logic

### 10. Improve Schema Validation

- [ ] Re-validate entire entity after patch
- [ ] Add domain-specific validation methods
- [ ] Use Schema refinements for complex rules

## Code Examples

### Example: Fixed TimeEntry Model

```typescript
export class TimeEntry extends Schema.Class<TimeEntry>(
  "@mason/mason/timeEntry"
)(
  Schema.Struct({
    id: TimeEntryId,
    workspaceId: WorkspaceId,
    memberId: MemberId,
    projectId: ProjectId,
    taskId: Schema.NullOr(TaskId),
    startedAt: Schema.DateFromSelf,
    stoppedAt: Schema.NullOr(Schema.DateFromSelf), // Optional
    notes: Schema.NullOr(JsonRecord),
  }).pipe(
    Schema.filter(
      ({ startedAt, stoppedAt }) =>
        stoppedAt === null || isAfter(stoppedAt, startedAt),
      {
        message: () => "stoppedAt must be after startedAt",
        identifier: "TimeEntryDateOrder",
      }
    )
  )
) {
  // Domain methods
  isRunning(): boolean {
    return this.stoppedAt === null;
  }

  stop(stoppedAt: Date): Effect.Effect<TimeEntry, TimeEntryDateOrderError> {
    if (!isAfter(stoppedAt, this.startedAt)) {
      return Effect.fail(
        new TimeEntryDateOrderError({
          startedAt: this.startedAt,
          stoppedAt,
        })
      );
    }
    return Effect.succeed(TimeEntry.make({ ...this, stoppedAt }));
  }

  duration(): Option.Option<Duration> {
    return this.stoppedAt
      ? Option.some(Duration.between(this.startedAt, this.stoppedAt))
      : Option.none();
  }
}
```

### Example: Value Objects

```typescript
// packages/core/framework/src/value-objects/time-range.ts
export class TimeRange extends Schema.Class<TimeRange>(
  "@mason/framework/TimeRange"
)(
  Schema.Struct({
    start: Schema.DateFromSelf,
    end: Schema.DateFromSelf,
  }).pipe(
    Schema.filter(({ start, end }) => isAfter(end, start), {
      message: () => "End must be after start",
      identifier: "TimeRangeOrder",
    })
  )
) {
  static make(start: Date, end: Date) {
    return Schema.decodeUnknown(TimeRange)({ start, end });
  }

  contains(date: Date): boolean {
    return isAfterOrEqual(date, this.start) && isBeforeOrEqual(date, this.end);
  }

  overlaps(other: TimeRange): boolean {
    return (
      this.contains(other.start) ||
      this.contains(other.end) ||
      other.contains(this.start) ||
      other.contains(this.end)
    );
  }

  duration(): Duration {
    return Duration.between(this.start, this.end);
  }
}
```

### Example: Domain-Specific Errors

```typescript
// packages/core/modules/time-tracking/src/errors.ts
export class TimeEntryNotFoundError extends Schema.TaggedError<TimeEntryNotFoundError>()(
  "@mason/time-tracking/TimeEntryNotFoundError",
  {
    timeEntryId: TimeEntryId,
  }
) {}

export class OverlappingTimeEntryError extends Schema.TaggedError<OverlappingTimeEntryError>()(
  "@mason/time-tracking/OverlappingTimeEntryError",
  {
    existingEntry: TimeEntry,
    conflictingEntry: TimeEntry,
  }
) {}

export class InvalidTimeRangeError extends Schema.TaggedError<InvalidTimeRangeError>()(
  "@mason/time-tracking/InvalidTimeRangeError",
  {
    startedAt: Schema.DateFromSelf,
    stoppedAt: Schema.DateFromSelf,
    reason: Schema.String,
  }
) {}

export type TimeTrackingModuleError =
  | TimeEntryNotFoundError
  | OverlappingTimeEntryError
  | InvalidTimeRangeError
  | TimeEntryDateOrderError;
```

### Example: Improved Repository

```typescript
export class TimeEntryRepository extends Context.Tag(
  "@mason/time-tracking/TimeEntryRepository"
)<
  TimeEntryRepository,
  {
    findById: (params: {
      workspaceId: WorkspaceId;
      timeEntryId: TimeEntryId;
    }) => Effect.Effect<Option.Option<TimeEntry>, RepositoryError>;

    exists: (params: {
      workspaceId: WorkspaceId;
      timeEntryId: TimeEntryId;
    }) => Effect.Effect<boolean, RepositoryError>;

    insert: (params: {
      workspaceId: WorkspaceId;
      timeEntries: Array<TimeEntry>;
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, RepositoryError>;

    // ... other methods
  }
>() {
  static readonly live = Layer.effect(
    TimeEntryRepository,
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      // Map domain model to persistence model
      const toPersistence = (entry: TimeEntry) => ({
        id: entry.id,
        workspaceId: entry.workspaceId,
        memberId: entry.memberId,
        projectId: entry.projectId,
        taskId: entry.taskId,
        startedAt: entry.startedAt,
        stoppedAt: entry.stoppedAt,
        notes: entry.notes,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      });

      // Map persistence model to domain model
      const toDomain = (
        row: DbTimeEntry
      ): Effect.Effect<TimeEntry, ParseError> =>
        Schema.decodeUnknown(TimeEntry)(row);

      return TimeEntryRepository.of({
        findById: Effect.fn("TimeEntryRepo.findById")(
          ({ workspaceId, timeEntryId }) =>
            db.withWorkspace(
              workspaceId,
              Effect.gen(function* () {
                const row = yield* db.drizzle.query.timeEntriesTable.findFirst({
                  where: and(
                    eq(timeEntriesTable.workspaceId, workspaceId),
                    eq(timeEntriesTable.id, timeEntryId)
                  ),
                });
                return row ? Option.some(yield* toDomain(row)) : Option.none();
              })
            )
        ),

        exists: Effect.fn("TimeEntryRepo.exists")(
          ({ workspaceId, timeEntryId }) =>
            db.withWorkspace(
              workspaceId,
              Effect.gen(function* () {
                const count = yield* db.drizzle
                  .select({ count: sql<number>`count(*)` })
                  .from(timeEntriesTable)
                  .where(
                    and(
                      eq(timeEntriesTable.workspaceId, workspaceId),
                      eq(timeEntriesTable.id, timeEntryId)
                    )
                  );
                return count[0]?.count > 0;
              })
            )
        ),

        // ... other methods with proper mapping
      });
    })
  );
}
```

### Example: Domain Service with Business Logic

```typescript
export class TimeEntryDomainService extends Context.Tag(
  "@mason/time-tracking/TimeEntryDomainService"
)<
  TimeEntryDomainService,
  {
    createTimeEntry: (params: {
      workspaceId: WorkspaceId;
      memberId: MemberId;
      projectId: ProjectId;
      taskId: Option.Option<TaskId>;
      startedAt: Date;
      stoppedAt: Option.Option<Date>;
      notes: Option.Option<JsonRecord>;
    }) => Effect.Effect<TimeEntry, TimeTrackingModuleError>;
  }
>() {
  static readonly live = Layer.effect(
    TimeEntryDomainService,
    Effect.gen(function* () {
      const repo = yield* TimeEntryRepository;
      const clock = yield* Clock;

      return TimeEntryDomainService.of({
        createTimeEntry: Effect.fn("TimeEntryDomainService.createTimeEntry")(
          function* (params) {
            // Business rule: Check for overlapping entries
            const existingEntries = yield* repo.list({
              workspaceId: params.workspaceId,
              query: {
                // Query for entries in the same time range
              },
            });

            const newTimeRange = TimeRange.make(
              params.startedAt,
              params.stoppedAt.pipe(
                Option.getOrElse(() => yield* clock.currentTimeMillis)
              )
            );

            const overlapping = existingEntries.find((entry) => {
              const entryRange = TimeRange.make(
                entry.startedAt,
                entry.stoppedAt
              );
              return newTimeRange.overlaps(entryRange);
            });

            if (overlapping) {
              return yield* Effect.fail(
                new OverlappingTimeEntryError({
                  existingEntry: overlapping,
                  conflictingEntry: newTimeRange,
                })
              );
            }

            // Create the time entry
            return yield* TimeEntry.makeFromCreate(
              {
                memberId: params.memberId,
                projectId: params.projectId,
                taskId: params.taskId,
                startedAt: params.startedAt,
                stoppedAt: params.stoppedAt,
                notes: params.notes,
              },
              params.workspaceId
            );
          }
        ),
      });
    })
  );
}
```

## Summary

Your architecture shows good understanding of Effect-TS and modular monolith patterns. The main areas for improvement are:

1. **Domain Modeling**: Make domain models richer with business logic and proper validation
2. **Aggregate Boundaries**: Define clear aggregate roots and enforce boundaries
3. **Error Handling**: Use specific domain errors instead of generic ones
4. **Value Objects**: Extract domain concepts into value objects
5. **Effect-TS Best Practices**: Use Clock, tracing, and proper resource management

The foundation is solid - these improvements will make it production-ready.

