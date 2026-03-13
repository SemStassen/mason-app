# Time Module Refactor Plan

**Module path**: `packages/core/src/modules/time/`  
**Reference module**: `packages/core/src/modules/workspace-invitation/`

---

## Files to Delete

### `domain/errors.ts`

- **Why**: Orphaned. `TimeEntryTransitionError` uses the old `Schema.TaggedError` API (not `Schema.TaggedErrorClass`), has inconsistent 2-space indentation, and is never imported anywhere in the codebase.
- **Action**: Delete the file entirely.

---

## Files to Modify

### `domain/time-entry.entity.ts`

**1. `static create(...)` — inject `now` and default `startedAt`**

Currently `startedAt` is passed in as a required param (even though it's `ClientOptional` on the model). The layer should inject `now` from `DateTime.now` and use it as the fallback, matching the `WorkspaceInvitation.create({ ..., now })` pattern.

Change the signature to:

```ts
static create(params: {
  workspaceId: TimeEntry["workspaceId"];
  workspaceMemberId: TimeEntry["workspaceMemberId"];
  projectId: TimeEntry["projectId"];
  taskId?: TimeEntry["taskId"];
  startedAt?: TimeEntry["startedAt"];   // optional — defaults to now
  stoppedAt?: TimeEntry["stoppedAt"];   // optional — for creating already-completed entries
  notes?: TimeEntry["notes"];
  now: DateTime.Utc;                    // injected by the layer
}): TimeEntry
```

Implementation:

```ts
return TimeEntry.make({
  ...params,
  id: TimeEntryId.makeUnsafe(generateUUID()),
  startedAt: params.startedAt ?? params.now,
  taskId: params.taskId ?? Option.none(),
  stoppedAt: params.stoppedAt ?? Option.none(),
  notes: params.notes ?? Option.none(),
});
```

**Rationale**: `startedAt` is `ClientOptional` — the client may provide it for manual/historical time logging, but if absent the server sets it to `now`. This mirrors how invitations use `WorkspaceInvitation.defaultExpiration(now)`.

---

### `domain/time-entry.transitions.ts`

**1. Remove dead `ensureNotRunning` guard**

`ensureNotRunning` is defined but never called by any exported function. Remove it to eliminate dead code and confusion with `ensureRunning`.

**2. No other changes needed**

`stopTimeEntry` and `updateTimeEntry` are correctly implemented using `Result.gen`. Keep them as-is.

---

### `time-entry.repository.ts` (service-level interface)

**1. Add `workspaceId` to `findById`**

The current signature `findById(id: TimeEntry["id"])` does not scope queries by workspace — a security and correctness gap. The concrete infra repo already scopes by `workspaceId` in its `retrieve` query.

Change to:

```ts
readonly findById: (params: {
  workspaceId: TimeEntry["workspaceId"];
  id: TimeEntry["id"];
}) => Effect.Effect<Option.Option<TimeEntry>, RepositoryError>;
```

This aligns with `WorkspaceInvitationRepository.findById({ workspaceId, id })`.

---

### `time.service.ts`

**1. Add `stopTimeEntry` method**

The domain transition `stopTimeEntry` exists but is never exposed through the service layer. Add it to the `TimeModuleShape` interface:

```ts
readonly stopTimeEntry: (params: {
  id: TimeEntry["id"];
  workspaceId: TimeEntry["workspaceId"];
  stoppedAt?: DateTime.Utc;   // optional — defaults to DateTime.now in the layer
}) => Effect.Effect<
  TimeEntry,
  | TimeEntryNotFoundError
  | TimeEntryNotRunningError
  | TimeEntryStoppedAtBeforeStartedAtError
  | RepositoryError
>;
```

**Rationale**: Stopping a timer is a distinct domain operation protected by its own guard (`ensureRunning`) and invariant (`ensureValidDateRange`). It should not be conflated with `updateTimeEntry`, which is a general metadata patch. This also future-proofs for multi-timer support — each timer has its own explicit start/stop lifecycle.

Intended REST mapping:
- `POST /time-entries` → `createTimeEntry` (start a timer, or log a completed entry if `stoppedAt` is provided)
- `POST /time-entries/:id/stop` → `stopTimeEntry`
- `PATCH /time-entries/:id` → `updateTimeEntry`
- `DELETE /time-entries/:id` → `hardDeleteTimeEntry`

---

### `time.layer.ts`

**1. Fix `createTimeEntry` — inject `now`, default `startedAt`**

```ts
createTimeEntry: Effect.fn("time.createTimeEntry")(function* (params) {
  const now = yield* DateTime.now;

  const timeEntry = TimeEntry.create({
    ...params.data,
    workspaceId: params.workspaceId,
    workspaceMemberId: params.workspaceMemberId,
    now,
  });

  const [persistedTimeEntry] = yield* timeEntryRepo.insert([timeEntry]);
  return persistedTimeEntry;
}),
```

**2. Fix `updateTimeEntry` — two bugs to fix**

*Bug A*: `findById` returns `Option<TimeEntry>` but the result is spread directly into `TimeEntry.make({ ...timeEntry })` without unwrapping. When the entry doesn't exist, `timeEntry` is an `Option` object and the spread silently produces a corrupt entity.

*Bug B*: The raw `TimeEntry.make({ ...timeEntry, ...params.data })` spread bypasses the `updateTimeEntry` transition in `time-entry.transitions.ts`, so `ensureValidDateRange` is never enforced on patch operations.

Fixed implementation:

```ts
updateTimeEntry: Effect.fn("time.updateTimeEntry")(function* (params) {
  const timeEntry = yield* timeEntryRepo
    .findById({ workspaceId: params.workspaceId, id: params.id })
    .pipe(
      Effect.flatMap(
        Option.match({
          onNone: () =>
            Effect.fail(new TimeEntryNotFoundError({ timeEntryId: params.id })),
          onSome: Effect.succeed,
        }),
      ),
    );

  const updatedTimeEntry = yield* Effect.fromResult(
    applyUpdateTimeEntry({ timeEntry, data: params.data }),
  );

  return yield* timeEntryRepo.update(updatedTimeEntry);
}),
```

Note: The transition import `updateTimeEntry` conflicts with the method name. Import it with an alias, e.g.:

```ts
import {
  stopTimeEntry as applyStopTimeEntry,
  updateTimeEntry as applyUpdateTimeEntry,
} from "./domain/time-entry.transitions";
```

**3. Fix `hardDeleteTimeEntry` — pass `workspaceId` to `findById`**

Update the existing `findById` call:

```ts
const timeEntry = yield* timeEntryRepo
  .findById({ workspaceId: params.workspaceId, id: params.id })
  .pipe( ... );
```

**4. Add `stopTimeEntry`**

```ts
stopTimeEntry: Effect.fn("time.stopTimeEntry")(function* (params) {
  const now = yield* DateTime.now;

  const timeEntry = yield* timeEntryRepo
    .findById({ workspaceId: params.workspaceId, id: params.id })
    .pipe(
      Effect.flatMap(
        Option.match({
          onNone: () =>
            Effect.fail(new TimeEntryNotFoundError({ timeEntryId: params.id })),
          onSome: Effect.succeed,
        }),
      ),
    );

  const stoppedTimeEntry = yield* Effect.fromResult(
    applyStopTimeEntry({
      timeEntry,
      stoppedAt: params.stoppedAt ?? now,
    }),
  );

  return yield* timeEntryRepo.update(stoppedTimeEntry);
}),
```

---

### `index.ts`

**Export all public errors**

Currently only `TimeEntry` and `TimeModule` are exported. Consumers (flows, RPC handlers, tests) need to handle domain errors via `Effect.catchTag`. Add:

```ts
export { TimeEntry } from "./domain/time-entry.entity";
export {
  TimeEntryAlreadyRunningError,
  TimeEntryAlreadyStoppedError,
  TimeEntryNotRunningError,
  TimeEntryStoppedAtBeforeStartedAtError,
} from "./domain/time-entry.errors";
export { TimeEntryNotFoundError, TimeModule } from "./time.service";
```

---

## Summary

| File | Change | Reason |
| :--- | :--- | :--- |
| `domain/errors.ts` | **Delete** | Orphaned, old API, never used |
| `domain/time-entry.entity.ts` | **Modify** | `create()` accepts `now`, defaults `startedAt` to `now` |
| `domain/time-entry.transitions.ts` | **Modify** | Remove dead `ensureNotRunning` |
| `time-entry.repository.ts` | **Modify** | `findById` scoped by `workspaceId` |
| `time.service.ts` | **Modify** | Add `stopTimeEntry` method |
| `time.layer.ts` | **Modify** | Fix Option unwrap bug, wire transitions, add `stopTimeEntry`, inject `now` |
| `index.ts` | **Modify** | Export all public errors |

---

## Out of Scope

- `repositories/time-entry.repo.ts` — the concrete Drizzle implementation is not modified. The `findById` interface change will need a follow-up adapter when the infra repo is next touched.
- `notes` field schema — kept as `Schema.Json`.
- `stoppedAt` encoding bug in `timeEntryToDb` (`DateTime.toDate` called on an `Option`) — lives in the infra repo, out of scope.
