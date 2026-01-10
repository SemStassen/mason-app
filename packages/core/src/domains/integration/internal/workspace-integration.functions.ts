import { DateTime, Effect, Option, Schema } from "effect";
import { dual } from "effect/Function";
import {
  type EncryptedApiKey,
  type MemberId,
  type PlainApiKey,
  type WorkspaceId,
  WorkspaceIntegrationId,
} from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import type {
  CreateWorkspaceIntegrationCommand,
  UpdateWorkspaceIntegrationApiKeyCommand,
} from "../schemas";
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
  input: CreateWorkspaceIntegrationCommand,
  system: {
    workspaceId: WorkspaceId;
    createdByMemberId: MemberId;
    encryptApiKey: (plainApiKey: PlainApiKey) => Effect.Effect<EncryptedApiKey>;
  }
): Effect.Effect<WorkspaceIntegration, IntegrationDomainError> =>
  Effect.gen(function* () {
    const defaults = yield* makeDefaults;

    const encryptedApiKey = yield* system.encryptApiKey(input.plainApiKey);

    return yield* _validate({
      ...defaults,
      ...input,
      encryptedApiKey: encryptedApiKey,
      workspaceId: system.workspaceId,
      createdByMemberId: system.createdByMemberId,
      id: WorkspaceIntegrationId.make(generateUUID()),
      _tag: "WorkspaceIntegration",
    });
  });

// =============================================================================
// Transformations
// =============================================================================

/**
 * Update a workspace integration API key.
 *
 * @category Transformations
 * @since 0.1.0
 */
const updateWorkspaceIntegrationApiKey = dual<
  (params: {
    plainApiKey: UpdateWorkspaceIntegrationApiKeyCommand;
    encryptApiKey: (key: PlainApiKey) => Effect.Effect<EncryptedApiKey>;
  }) => (
    self: WorkspaceIntegration
  ) => Effect.Effect<WorkspaceIntegration, IntegrationDomainError>,
  (
    self: WorkspaceIntegration,
    params: {
      plainApiKey: UpdateWorkspaceIntegrationApiKeyCommand;
      encryptApiKey: (key: PlainApiKey) => Effect.Effect<EncryptedApiKey>;
    }
  ) => Effect.Effect<WorkspaceIntegration, IntegrationDomainError>
>(2, (self, { plainApiKey, encryptApiKey }) =>
  Effect.gen(function* () {
    const encryptedApiKey = yield* encryptApiKey(plainApiKey);

    return yield* _validate({
      ...self,
      encryptedApiKey,
      id: self.id,
      _metadata: self._metadata,
    });
  })
);

export const WorkspaceIntegrationFns = {
  create: createWorkspaceIntegration,
  updateApiKey: updateWorkspaceIntegrationApiKey,
} as const;
