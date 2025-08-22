import { HttpApiBuilder, HttpApiError } from '@effect/platform';
import { MasonApi } from '@mason/api-contract';
import { Effect } from 'effect';
import { AuthService } from '~/services/auth';

export const WorkspaceGroupLive = HttpApiBuilder.group(
  MasonApi,
  'Workspace',
  (handlers) =>
    Effect.gen(function* () {
      const auth = yield* AuthService;
      return handlers
        .handle('CheckSlugAvailability', ({ request, payload }) =>
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
        .handle('CreateWorkspace', ({ request, payload }) =>
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

            return {
              id: workspace.id,
              name: workspace.name,
              slug: workspace.slug,
              logoUrl: workspace.logo || null,
              metadata: workspace.metadata || null,
            };
          }).pipe(Effect.mapError(() => new HttpApiError.InternalServerError()))
        )
        .handle('RetrieveWorkspace', ({ request, payload }) =>
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

            return {
              id: workspace.id,
              name: workspace.name,
              slug: workspace.slug,
              logoUrl: workspace.logo || null,
              metadata: workspace.metadata || null,
            };
          }).pipe(Effect.mapError(() => new HttpApiError.InternalServerError()))
        )
        .handle('ListWorkspaces', ({ request }) =>
          Effect.gen(function* () {
            const workspaces = yield* auth.use((client) =>
              client.api.listOrganizations({
                headers: request.headers,
              })
            );

            if (!workspaces) {
              return yield* Effect.fail(new HttpApiError.InternalServerError());
            }

            return workspaces.map((workspace) => ({
              id: workspace.id,
              name: workspace.name,
              slug: workspace.slug,
              logoUrl: workspace.logo || null,
              metadata: workspace.metadata || null,
            }));
          }).pipe(Effect.mapError(() => new HttpApiError.InternalServerError()))
        )
        .handle('UpdateWorkspace', ({ request, payload, path }) =>
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

            return {
              id: updatedWorkspace.id,
              name: updatedWorkspace.name,
              slug: updatedWorkspace.slug,
              logoUrl: updatedWorkspace.logo || null,
              metadata: updatedWorkspace.metadata || null,
            };
          }).pipe(Effect.mapError(() => new HttpApiError.InternalServerError()))
        );
    })
);
