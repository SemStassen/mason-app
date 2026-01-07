import {
  HttpApiBuilder,
  HttpApiError,
  HttpServerResponse,
} from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { WorkspaceResponse } from "@mason/api-contract/dto/workspace.dto";
import { AuthService } from "@mason/mason/services/auth.service";
import { Effect } from "effect";

export const WorkspaceGroupLive = HttpApiBuilder.group(
  MasonApi,
  "Workspace",
  (handlers) =>
    Effect.gen(function* () {
      const auth = yield* AuthService;
      return handlers
        .handle("CheckSlugAvailability", ({ request, payload }) =>
          Effect.gen(function* () {
            const isAvailable = yield* auth.use((client) =>
              client.api.checkOrganizationSlug({
                body: payload,
                headers: request.headers,
              })
            );

            return isAvailable;
          }).pipe(
            Effect.tapError((e) => Effect.logError(e)),
            Effect.mapError(() => new HttpApiError.InternalServerError())
          )
        )
        .handle("SetActive", ({ request, payload }) =>
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
          }).pipe(
            Effect.tapError((e) => Effect.logError(e)),
            Effect.mapError(() => new HttpApiError.InternalServerError())
          )
        )
        .handle("Create", ({ request, payload }) =>
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

            return WorkspaceResponse.make({
              ...workspace,
              id: workspace.id,
              logoUrl: workspace.logo || null,
              metadata: workspace.metadata || null,
            });
          }).pipe(
            Effect.tapError((e) => Effect.logError(e)),
            Effect.mapError(() => new HttpApiError.InternalServerError())
          )
        )
        .handle("Retrieve", ({ request, payload }) =>
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

            return WorkspaceResponse.make({
              ...workspace,
              id: workspace.id,
              logoUrl: workspace.logo || null,
              metadata: workspace.metadata || null,
            });
          }).pipe(
            Effect.tapError((e) => Effect.logError(e)),
            Effect.mapError(() => new HttpApiError.InternalServerError())
          )
        )
        .handle("List", ({ request }) =>
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
              WorkspaceResponse.make({
                ...workspace,
                id: workspace.id,
                logoUrl: workspace.logo || null,
                metadata: workspace.metadata || null,
              })
            );
          }).pipe(
            Effect.tapError((e) => Effect.logError(e)),
            Effect.mapError(() => new HttpApiError.InternalServerError())
          )
        )
        .handle("Update", ({ request, payload, path }) =>
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

            return WorkspaceResponse.make({
              ...updatedWorkspace,
              id: updatedWorkspace.id,
              logoUrl: updatedWorkspace.logo || null,
              metadata: updatedWorkspace.metadata || null,
            });
          }).pipe(
            Effect.tapError((e) => Effect.logError(e)),
            Effect.mapError(() => new HttpApiError.InternalServerError())
          )
        );
    })
);
