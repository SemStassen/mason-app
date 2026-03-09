import {  Effect, Layer, Schema, ServiceMap  } from "effect";
import type { Action } from "./rbac";

export type WorkspaceRole = typeof WorkspaceRole.Type;
export const WorkspaceRole = Schema.Literals(["owner", "member"]);

export class AuthorizationError extends Schema.TaggedErrorClass<AuthorizationError>()(
  "authorization/AuthorizationError",
  {},
) {}

export class AuthorizationService extends ServiceMap.Service<
  AuthorizationService,
  {
    ensureAllowed: (params: {
      action: Action;
      role: WorkspaceRole;
    }) => Effect.Effect<void, AuthorizationError>;
  }
>()("@mason/authorization/AuthorizationService") {
  static readonly live = Layer.effect(
    AuthorizationService,
    Effect.gen(function* () {
      const permissionRules: Record<Action, ReadonlyArray<WorkspaceRole>> = {
        "workspace:invite_user": ["owner"],
        "workspace:cancel_invite": ["owner"],
        "workspace:patch": ["owner"],
        "workspace:delete": ["owner"],
        "workspace:create_integration": ["owner"],
        "workspace:delete_integration": ["owner"],
        "project:create": ["owner"],
        "project:patch": ["owner"],
        "project:archive": ["owner"],
        "project:restore": ["owner"],
        "project:create_task": ["owner"],
        "project:patch_task": ["owner"],
        "project:archive_task": ["owner"],
        "project:restore_task": ["owner",],
      };

      return AuthorizationService.of({
        ensureAllowed: Effect.fn("authorization.ensureAllowed")(function* ({
          role,
          action,
        }) {
          if (!permissionRules[action].includes(role)) {
            yield* new AuthorizationError();
          }
        }),
      });
    }),
  );
}
