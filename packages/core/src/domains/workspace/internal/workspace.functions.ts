import { Effect, Option, Schema } from "effect";
import { dual } from "effect/Function";
import { WorkspaceId } from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import type { CreateWorkspaceCommand, PatchWorkspaceCommand } from "../schemas";
import { Workspace } from "../schemas/workspace.model";
import { WorkspaceDomainError } from "./errors";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a Workspace via Schema. */
const _validate = (
  input: typeof Workspace.Type
): Effect.Effect<Workspace, WorkspaceDomainError> =>
  Schema.validate(Workspace)(input).pipe(
    Effect.catchTags({
      ParseError: (e) => Effect.fail(new WorkspaceDomainError({ cause: e })),
    })
  );

/** Default values for new workspaces. */
const defaults = {
  logoUrl: Option.none(),
  metadata: Option.none(),
} as const;

/**
 * Create a new workspace with generated ID.
 *
 * @category Constructors
 * @since 0.1.0
 */
const createWorkspace = (
  input: CreateWorkspaceCommand
): Effect.Effect<Workspace, WorkspaceDomainError> =>
  _validate({
    ...defaults,
    ...input,
    id: WorkspaceId.make(generateUUID()),
    _tag: "Workspace",
  });

// =============================================================================
// Transformations
// =============================================================================

/**
 * Patch a workspace with patch data.
 *
 * @category Transformations
 * @since 0.1.0
 */
const patchWorkspace = dual<
  (
    patch: PatchWorkspaceCommand
  ) => (self: Workspace) => Effect.Effect<Workspace, WorkspaceDomainError>,
  (
    self: Workspace,
    patch: PatchWorkspaceCommand
  ) => Effect.Effect<Workspace, WorkspaceDomainError>
>(2, (self, patch) =>
  _validate({
    ...self,
    ...patch,
    id: self.id,
  })
);

export const WorkspaceFns = {
  create: createWorkspace,
  patch: patchWorkspace,
} as const;
