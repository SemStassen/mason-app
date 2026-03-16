import { Effect, Layer, Schema, ServiceMap } from "effect";
import type { Action } from "./rbac";

export type WorkspaceRole = typeof WorkspaceRole.Type;
export const WorkspaceRole = Schema.Literals(["owner", "member"]);

export class AuthorizationError extends Schema.TaggedErrorClass<AuthorizationError>()(
  "authorization/AuthorizationError",
  {}
) {}

export class Authorization extends ServiceMap.Service<
  Authorization,
  {
    ensureAllowed: (params: {
      action: Action;
      role: WorkspaceRole;
    }) => Effect.Effect<void, AuthorizationError>;
  }
>()("@mason/authorization/Authorization") {
  static readonly live = Layer.effect(
    Authorization,
    Effect.sync(() => {
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
        "project:restore_task": ["owner"],

        "time:create_time_entry": ["owner"],
        "time:update_time_entry": ["owner"],
        "time:delete_time_entry": ["owner"],
      };

      return Authorization.of({
        ensureAllowed: Effect.fn("authorization.ensureAllowed")(function* ({
          role,
          action,
        }) {
          if (!permissionRules[action].includes(role)) {
            return yield* new AuthorizationError();
          }
        }),
      });
    })
  );
}
