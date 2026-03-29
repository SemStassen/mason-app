import type { Project } from "@mason/core/modules/project";
import type { WorkspaceMember } from "@mason/core/modules/workspace-member";
import { persistedCollectionOptions } from "@tanstack/browser-db-sqlite-persistence";
import { createCollection } from "@tanstack/react-db";

import { persistence } from "./persistence";

export const workspaceMembersCollection = createCollection(
  persistedCollectionOptions<typeof WorkspaceMember.json.Type, string>({
    id: `workspace-members`,
    getKey: (workspaceMember) => workspaceMember.id,
    persistence,
    schemaVersion: 1,
  })
);

export const projectsCollection = createCollection(
  persistedCollectionOptions<typeof Project.json.Type, string>({
    id: "projects",
    getKey: (project) => project.id,
    persistence,
    schemaVersion: 1,
  })
);
