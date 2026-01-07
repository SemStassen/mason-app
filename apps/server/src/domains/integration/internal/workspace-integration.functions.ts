import { DateTime, Effect, Option, Schema } from "effect";
import { dual } from "effect/Function";
import {
  type MemberId,
  type WorkspaceId,
  WorkspaceIntegrationId,
} from "~/shared/schemas";
import { generateUUID, safeMerge } from "~/shared/utils";
import { WorkspaceIntegration } from "../schemas/workspace-integration.model";
import { IntegrationDomainError } from "./errors";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a Workspace Integration via Schema. */
const _validate = (
  input: WorkspaceIntegration
): Effect.Effect<WorkspaceIntegration, IntegrationDomainError> =>
  Schema.validate(WorkspaceIntegration)(input).pipe(
    Effect.catchTags({
      ParseError: (e) => Effect.fail(new IntegrationDomainError({ cause: e })),
    })
  );

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
const createWorkspaceIntegration = (
  input: {
    kind: WorkspaceIntegration["kind"];
    encryptedApiKey: WorkspaceIntegration["encryptedApiKey"];
  },
  system: {
    workspaceId: WorkspaceId;
    createdByMemberId: MemberId;
  }
): Effect.Effect<WorkspaceIntegration, IntegrationDomainError> =>
  Effect.gen(function* () {
    const defaults = yield* makeDefaults;

    return yield* _validate({
      ...defaults,
      ...input,
      workspaceId: system.workspaceId,
      createdByMemberId: system.createdByMemberId,
      id: WorkspaceIntegrationId.make(generateUUID()),
      _tag: "WorkspaceIntegration",
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
const updateWorkspaceIntegration = dual<
  (
    patch: PatchWorkspaceIntegration
  ) => (
    self: WorkspaceIntegration
  ) => Effect.Effect<WorkspaceIntegration, IntegrationDomainError>,
  (
    self: WorkspaceIntegration,
    patch: PatchWorkspaceIntegration
  ) => Effect.Effect<WorkspaceIntegration, IntegrationDomainError>
>(2, (self, patch) =>
  _validate({
    ...self,
    ...patch,
    id: self.id,
    _metadata: safeMerge(self._metadata, patch._metadata),
  })
);

export const WorkspaceIntegrationFns = {
  create: createWorkspaceIntegration,
  update: updateWorkspaceIntegration,
} as const;
