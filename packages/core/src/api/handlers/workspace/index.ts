import {
  HttpApiBuilder,
  HttpApiError,
  HttpServerResponse,
} from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { Effect } from "effect";
import { WorkspaceId } from "~/models/shared";
import { Workspace } from "~/models/workspace.model";
import { AuthService } from "~/services/auth";

export const WorkspaceGroupLive = HttpApiBuilder.group(
  MasonApi,
  "Workspace",
  (handlers) =>
    Effect.gen(function* () {
      const auth = yield* AuthService;
      return handlers
        .handle("CheckWorkspaceSlugAvailability", ({ request, payload }) =>
          Effect.gen(function* () {
            const isAvailable = yield* auth.use((client) =>
              client.api.checkOrganizationSlug({
                body: payload,
                headers: request.headers,
              })
            );

            return isAvailable;
          }).pipe(Effect.mapError(() => new HttpApiError.InternalServerError()))
        )
        .handle("SetActiveWorkspace", ({ request, payload }) =>
          Effect.gen(function* () {
            yield* auth.use((client) =>
              client.api.setActiveOrganization({
                body: {
                  organizationId: payload.workspaceId,
                  organizationSlug: payload.workspaceSlug,
                },
                headers: request.headers,
              })
            );

            return HttpServerResponse.empty();
          }).pipe(Effect.mapError(() => new HttpApiError.InternalServerError()))
        )
        .handle("CreateWorkspace", ({ request, payload }) =>
          Effect.gen(function* () {
            const workspace = yield* auth.use((client) =>
              client.api.createOrganization({
                body: payload,
                headers: request.headers,
              })
            );

            if (!workspace) {
              return yield* Effect.fail(new HttpApiError.InternalServerError());
            }

            return Workspace.make({
              ...workspace,
              id: WorkspaceId.make(workspace.id),
              logoUrl: workspace.logo || null,
              metadata: workspace.metadata || null,
            });
          }).pipe(Effect.mapError(() => new HttpApiError.InternalServerError()))
        )
        .handle("RetrieveWorkspace", ({ request, payload }) =>
          Effect.gen(function* () {
            const workspace = yield* auth.use((client) =>
              client.api.getFullOrganization({
                query: {
                  organizationId: payload.workspaceId,
                  organizationSlug: payload.workspaceSlug,
                  membersLimit: payload.membersLimit,
                },
                headers: request.headers,
              })
            );

            if (!workspace) {
              return yield* Effect.fail(new HttpApiError.InternalServerError());
            }

            return Workspace.make({
              ...workspace,
              id: WorkspaceId.make(workspace.id),
              logoUrl: workspace.logo || null,
              metadata: workspace.metadata || null,
            });
          }).pipe(Effect.mapError(() => new HttpApiError.InternalServerError()))
        )
        .handle("ListWorkspaces", ({ request }) =>
          Effect.gen(function* () {
            const workspaces = yield* auth.use((client) =>
              client.api.listOrganizations({
                headers: request.headers,
              })
            );

            if (!workspaces) {
              return yield* Effect.fail(new HttpApiError.InternalServerError());
            }

            return workspaces.map((workspace) =>
              Workspace.make({
                ...workspace,
                id: WorkspaceId.make(workspace.id),
                logoUrl: workspace.logo || null,
                metadata: workspace.metadata || null,
              })
            );
          }).pipe(Effect.mapError(() => new HttpApiError.InternalServerError()))
        )
        .handle("UpdateWorkspace", ({ request, payload, path }) =>
          Effect.gen(function* () {
            const updatedWorkspace = yield* auth.use((client) =>
              client.api.updateOrganization({
                body: {
                  data: {
                    ...(payload.name !== undefined
                      ? { name: payload.name }
                      : {}),
                    ...(payload.slug !== undefined
                      ? { slug: payload.slug }
                      : {}),
                    ...(payload.logoUrl != null
                      ? { logo: payload.logoUrl }
                      : {}),
                  },
                  organizationId: path.workspaceId,
                },
                headers: request.headers,
              })
            );

            if (!updatedWorkspace) {
              return yield* Effect.fail(new HttpApiError.InternalServerError());
            }

            return Workspace.make({
              ...updatedWorkspace,
              id: WorkspaceId.make(updatedWorkspace.id),
              logoUrl: updatedWorkspace.logo || null,
              metadata: updatedWorkspace.metadata || null,
            });
          }).pipe(Effect.mapError(() => new HttpApiError.InternalServerError()))
        );
    })
);
