import type { WorkspaceId } from "@mason/core/models/ids";
import { ExternalProject } from "@mason/core/models/project.model";
import { ExternalTask } from "@mason/core/models/task.model";
import { WorkspaceIntegrationsService } from "@mason/core/services/workspace-integrations.service";
import { Effect, Layer, Schema } from "effect";
import { InternalTimeTrackingIntegrationAdapter } from "../adapter";
import {
  IntegrationDecodingError,
  IntegrationFetchError,
  IntegrationInvalidApiKeyError,
} from "../errors";
import { buildUrl, fetchPaginated, stringToTiptapJSON } from "../utils";

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
  /** Hex color (does not include #) */
  color?: string | null;
  /** 0 = Billable, 1 = Non-billable */
  non_billable?: 0 | 1;
  notes?: string | null;
  start_date?: string | null;
  end_date?: string | null;
};

/**
 * Represents a task from the Float API
 * Only the necessary fields are typed
 * @see https://developer.float.com/api_reference.html#Project_Tasks
 */
type FloatProjectTask = {
  task_meta_id: number;
  project_id: number;
  task_name: string;
};

const BASE_URL = "https://api.float.com/v3";
const CURRENT_PAGE_HEADER = "X-Pagination-Current-Page";
const TOTAL_PAGES_HEADER = "X-Pagination-Page-Count";

const floatFetch = ({ apiKey, path }: { apiKey: string; path: string }) =>
  Effect.gen(function* (_) {
    const res = yield* _(
      Effect.tryPromise({
        try: () =>
          fetch(`${BASE_URL}${path}`, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "User-Agent": "Mason app - private demo (semstassen@gmail.com)",
            },
          }),
        catch: (e) =>
          new IntegrationFetchError({ kind: "float", path: path, error: e }),
      })
    );

    if (!res.ok) {
      const body = yield* Effect.tryPromise({
        try: () => res.json(),
        catch: (e) => new IntegrationDecodingError({ error: e }),
      });

      if (res.status === 401) {
        return yield* _(
          Effect.fail(
            new IntegrationInvalidApiKeyError({
              kind: "float",
              path: path,
              error: body,
            })
          )
        );
      }

      return yield* _(
        Effect.fail(
          new IntegrationFetchError({ kind: "float", path: path, error: body })
        )
      );
    }

    return res;
  });

const floatGetNextPage = (response: Response) => {
  const currentPage = Number(response.headers.get(CURRENT_PAGE_HEADER));
  const totalPages = Number(response.headers.get(TOTAL_PAGES_HEADER));

  if (currentPage < totalPages) {
    return currentPage + 1;
  }

  return null;
};

export const floatLive = Layer.effect(
  InternalTimeTrackingIntegrationAdapter,
  Effect.gen(function* () {
    const workspaceIntegrationsService = yield* WorkspaceIntegrationsService;

    const retrieveFloatApiKey = ({
      workspaceId,
    }: {
      workspaceId: typeof WorkspaceId.Type;
    }) =>
      workspaceIntegrationsService.retrieveUnencryptedApiKey({
        workspaceId: workspaceId,
        kind: "float",
      });

    return {
      testIntegration: ({ apiKeyUnencrypted }) =>
        fetchPaginated({
          fetchPage: () =>
            floatFetch({
              apiKey: apiKeyUnencrypted,
              path: buildUrl("/people", { "per-page": 1 }),
            }),
          getNextPage: () => null,
          extractItems: (body) => body as Array<FloatPerson>,
        }),
      listActivePeople: ({ workspaceId }) =>
        Effect.gen(function* () {
          const apiKey = yield* retrieveFloatApiKey({ workspaceId });

          yield* fetchPaginated({
            fetchPage: () =>
              floatFetch({
                apiKey,
                path: buildUrl("/people", { active: 1 }),
              }),
            getNextPage: floatGetNextPage,
            extractItems: (body) => body as Array<FloatPerson>,
          });
        }),
      listProjects: ({ workspaceId }) =>
        Effect.gen(function* () {
          const apiKey = yield* retrieveFloatApiKey({ workspaceId });

          const floatProjects = yield* fetchPaginated({
            fetchPage: (page) =>
              floatFetch({
                apiKey,
                path: buildUrl("/projects", { page }),
              }),
            getNextPage: floatGetNextPage,
            extractItems: (body) =>
              (body as Array<FloatProject>).map((p) =>
                Schema.decodeUnknownSync(ExternalProject)({
                  externalId: String(p.project_id),
                  name: p.name,
                  ...(p.color && { hexColor: `#${p.color}` }),
                  ...(p.non_billable !== undefined && {
                    isBillable: p.non_billable === 0,
                  }),
                  ...(p.start_date && { startDate: p.start_date }),
                  ...(p.end_date && { endDate: p.end_date }),
                  ...(p.notes && { notes: stringToTiptapJSON(p.notes) }),
                })
              ),
          });

          return floatProjects;
        }),
      listTasks: ({ workspaceId }) =>
        Effect.gen(function* () {
          const apiKey = yield* retrieveFloatApiKey({ workspaceId });

          const floatTasks = yield* fetchPaginated({
            fetchPage: (page) =>
              floatFetch({
                apiKey,
                path: buildUrl("/project-tasks", { page, "per-page": 100 }),
              }),
            getNextPage: floatGetNextPage,
            extractItems: (body) =>
              (body as Array<FloatProjectTask>).map((t) =>
                Schema.decodeUnknownSync(ExternalTask)({
                  externalId: String(t.task_meta_id),
                  externalProjectId: String(t.project_id),
                  name: t.task_name,
                })
              ),
          });

          return floatTasks;
        }),
    };
  })
);
