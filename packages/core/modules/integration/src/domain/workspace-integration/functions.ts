import {
  type ExistingMemberId,
  type ExistingWorkspaceId,
  ExistingWorkspaceIntegrationId,
  generateUUID,
  safeMerge,
} from "@mason/framework";
import { DateTime, Effect, Option, type ParseResult, Schema } from "effect";
import { dual } from "effect/Function";
import { WorkspaceIntegration } from "./model";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a Workspace Integration via Schema. */
const make = (
  input: WorkspaceIntegration
): Effect.Effect<WorkspaceIntegration, ParseResult.ParseError> =>
  Schema.decodeUnknown(WorkspaceIntegration)(input);

/** Default values for new workspace integrations. */
const makeDefaults = Effect.gen(function* () {
  const createdAt = yield* DateTime.now;
  return {
    _metadata: Option.none(),
    createdAt,
  } as const;
});

/**
 * Create a new workspace integration with generated ID.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const create = (
  input: {
    kind: WorkspaceIntegration["kind"];
    encryptedApiKey: WorkspaceIntegration["encryptedApiKey"];
  },
  ids: {
    workspaceId: ExistingWorkspaceId;
    createdByMemberId: ExistingMemberId;
  }
): Effect.Effect<WorkspaceIntegration, ParseResult.ParseError> =>
  Effect.gen(function* () {
    const defaults = yield* makeDefaults;

    return yield* make({
      ...defaults,
      ...input,
      workspaceId: ids.workspaceId,
      createdByMemberId: ids.createdByMemberId,
      id: ExistingWorkspaceIntegrationId.make(generateUUID()),
      _tag: "@mason/integration/WorkspaceIntegration",
    });
  });

// =============================================================================
// Transformations
// =============================================================================

interface PatchWorkspaceIntegration {
  encryptedApiKey?: WorkspaceIntegration["encryptedApiKey"];
  _metadata?: WorkspaceIntegration["_metadata"];
}

/**
 * Update a workspace integration with patch data.
 *
 * @category Transformations
 * @since 0.1.0
 */
export const update = dual<
  (
    patch: PatchWorkspaceIntegration
  ) => (
    self: WorkspaceIntegration
  ) => Effect.Effect<WorkspaceIntegration, ParseResult.ParseError>,
  (
    self: WorkspaceIntegration,
    patch: PatchWorkspaceIntegration
  ) => Effect.Effect<WorkspaceIntegration, ParseResult.ParseError>
>(2, (self, patch) =>
  make({
    ...self,
    ...patch,
    id: self.id,
    _metadata: safeMerge(self._metadata, patch._metadata),
  })
);
