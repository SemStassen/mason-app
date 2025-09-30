import { CreateProjectRequest } from "@mason/api-contract/dto/project.dto";
import type { WorkspaceId } from "@mason/core/models/ids";
import { WorkspaceIntegrationsService } from "@mason/core/services/workspace-integrations";
import {  Effect, Layer } from "effect";
import { buildUrl, stringToTiptapJSON } from "../utils";
import { IntegrationFetchError } from "../errors";
import { InternalTimeTrackingIntegrationAdapter } from "../adapter";

/**
 * Represents a person from the Float API
 * Only the necessary fields are typed
 * @see https://developer.float.com/api_reference.html#People
 */
type FloatPerson = {
  people_id: number;
  email: string;
  name: string;
  active: 0 | 1;
};

/**
 * Represents a project from the Float API
 * Only the necessary fields are typed
 * @see https://developer.float.com/api_reference.html#Projects
 */
type FloatProject = {
  project_id: number;
  name: string;
  /** Hex color (may or may not include #) */
  color?: string | null;
  /** 0 = Billable, 1 = Non-billable */
  non_billable?: 0 | 1;
  notes?: string | null;
};

const BASE_URL = "https://api.float.com/v3";

const floatFetch = ({
  apiKey,
  path,
}: {
  apiKey: string;
  path: string;
}) =>
  Effect.tryPromise({
    try: () =>
      fetch(`${BASE_URL}${path}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "User-Agent": "Mason app - private demo (semstassen@gmail.com)",
        },
      }).then((res) => res.json()),
    catch: (e) => new IntegrationFetchError({
      kind: "float",
      error: e,
    }),
  });

export const floatLive = Layer.effect(
  InternalTimeTrackingIntegrationAdapter,
  Effect.gen(function* () {
    const workspaceIntegrationsService = yield* WorkspaceIntegrationsService;

    const retrieveFloatApiKey = ({
      workspaceId,
    }: {
      workspaceId: typeof WorkspaceId.Type;
    }) =>
      Effect.gen(function* () {
        return yield* workspaceIntegrationsService.retrieveUnencryptedApiKey({
          workspaceId: workspaceId,
          kind: "float",
        });
      })

    return {
      testIntegration: ({ workspaceId, apiKeyUnencrypted }) =>
        Effect.gen(function* () {
          yield* floatFetch({
            apiKey: apiKeyUnencrypted,
            path: buildUrl("/people", { "per-page": 1 }),
          });
        }),
      retrieveActivePersonByEmail: ({ workspaceId, email }) =>
        Effect.gen(function* () {
          const apiKey = yield* retrieveFloatApiKey({ workspaceId });

          const [floatPerson]: Array<FloatPerson> = yield* floatFetch({
            apiKey,
            path: buildUrl("/people", { active: 1, email: email }),
          });
        }),
      // TODO: add pagination
      listActivePeople: ({ workspaceId }) =>
        Effect.gen(function* () {
          const apiKey = yield* retrieveFloatApiKey({ workspaceId });

          // This just fetches the first 50 active people
          yield* floatFetch({
            apiKey,
            path: buildUrl("/people", { active: 1 }),
          });
        }),
      listProjects: ({ workspaceId }) =>
        Effect.gen(function* () {
          const apiKey = yield* retrieveFloatApiKey({ workspaceId });

          const floatProjects: Array<FloatProject> = yield* floatFetch({
            apiKey,
            path: "/projects",
          });

          return floatProjects.map((p) =>
            CreateProjectRequest.make({
              name: p.name,
              ...(p.color && { hexColor: p.color }),
              ...(p.non_billable !== undefined && {
                isBillable: p.non_billable === 0,
              }),
              ...(p.notes && { notes: stringToTiptapJSON(p.notes) }),
              metadata: {
                floatId: p.project_id,
              },
            })
          );
        }),
    };
  })
);
