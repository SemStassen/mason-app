import { Effect, Option, Schema } from "effect";
import { dual } from "effect/Function";
import { WorkspaceId } from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
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
const createWorkspace = (input: {
  name: Workspace["name"];
  slug: Workspace["slug"];
  logoUrl?: Workspace["logoUrl"];
  metadata?: Workspace["metadata"];
}): Effect.Effect<Workspace, WorkspaceDomainError> =>
  _validate({
    ...defaults,
    ...input,
    id: WorkspaceId.make(generateUUID()),
    _tag: "Workspace",
  });

// =============================================================================
// Transformations
// =============================================================================

interface PatchWorkspace {
  name?: Workspace["name"];
  slug?: Workspace["slug"];
  logoUrl?: Workspace["logoUrl"];
  metadata?: Workspace["metadata"];
}

/**
 * Update a workspace with patch data.
 *
 * @category Transformations
 * @since 0.1.0
 */
const updateWorkspace = dual<
  (
    patch: PatchWorkspace
  ) => (self: Workspace) => Effect.Effect<Workspace, WorkspaceDomainError>,
  (
    self: Workspace,
    patch: PatchWorkspace
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
  update: updateWorkspace,
} as const;
