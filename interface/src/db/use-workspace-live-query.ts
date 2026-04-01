import {
  type Context,
  type InitialQueryBuilder,
  type QueryBuilder,
  useLiveQuery as useTanstackLiveQuery,
} from "@tanstack/react-db";
import { use } from "react";

import { Route as WorkspaceRoute } from "~/routes/_app/$workspaceSlug/route";

import type { WorkspaceCollections } from "./collections";
import { getWorkspaceCollections } from "./workspace-collections";

export function useWorkspaceLiveQuery<TContext extends Context>(
  queryFn: (
    q: InitialQueryBuilder,
    db: WorkspaceCollections
  ) => QueryBuilder<TContext>
) {
  const { workspace } = WorkspaceRoute.useRouteContext();
  const db = use(getWorkspaceCollections(workspace.id));

  return useTanstackLiveQuery<TContext>((q) => queryFn(q, db));
}
