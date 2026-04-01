import { Project } from "@mason/core/modules/project";
import { WorkspaceMember } from "@mason/core/modules/workspace-member";
import { WORKSPACE_ID_HEADER } from "@mason/core/shared/headers";
import {
  BrowserCollectionCoordinator,
  createBrowserWASQLitePersistence,
  openBrowserWASQLiteOPFSDatabase,
} from "@tanstack/browser-db-sqlite-persistence";
import { Schema } from "effect";

import { env } from "~/lib/env";

import { createCollectionTemp } from "./create-collection-temp";

export type WorkspaceCollections = Awaited<
  ReturnType<typeof createWorkspaceCollections>
>;

export async function createWorkspaceCollections(workspaceId: string) {
  const database = await openBrowserWASQLiteOPFSDatabase({
    databaseName: `mason-${workspaceId}.sqlite`,
  });

  const coordinator = new BrowserCollectionCoordinator({
    dbName: `mason-${workspaceId}`,
  });

  const workspaceMembersCollection = createCollectionTemp({
    persistence: createBrowserWASQLitePersistence<
      typeof WorkspaceMember.json.Type,
      string | number
    >({
      database,
      coordinator,
    }),
    schemaVersion: 1,
    id: "workspace-members",
    schema: Schema.toStandardSchemaV1(WorkspaceMember.json),
    getKey: (wm) => wm.id,
    shapeOptions: {
      url: `${env.VITE_ELECTRIC_PROXY_URL}/workspace-members`,
      fetchClient: (url, options) =>
        fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            ...options?.headers,
            [WORKSPACE_ID_HEADER]: workspaceId,
          },
        }),
    },
  });

  const projectsCollection = createCollectionTemp({
    persistence: createBrowserWASQLitePersistence<
      typeof Project.json.Type,
      string | number
    >({
      database,
      coordinator,
    }),
    schemaVersion: 1,
    id: "projects",
    schema: Schema.toStandardSchemaV1(Project.json),
    getKey: (wm) => wm.id,
    shapeOptions: {
      url: `${env.VITE_ELECTRIC_PROXY_URL}/projects`,
      fetchClient: (url, options) =>
        fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            ...options?.headers,
            [WORKSPACE_ID_HEADER]: workspaceId,
          },
        }),
    },
  });

  return {
    workspaceMembersCollection,
    projectsCollection,
    close: async () => {
      coordinator.dispose();
      await database.close?.();
    },
  };
}
