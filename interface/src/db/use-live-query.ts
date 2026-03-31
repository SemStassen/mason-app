import {
  useLiveQuery as useTanstackLiveQuery,
  type InitialQueryBuilder,
} from "@tanstack/react-db";
import { use, useMemo } from "react";

import { createWorkspaceCollections } from "./collections";

export function useLiveQuery(
  queryFn: (
    q: InitialQueryBuilder,
    db: Awaited<ReturnType<typeof createWorkspaceCollections>>
  ) => unknown
) {
  const collections = use(createWorkspaceCollections("orgID"));

  return useTanstackLiveQuery((q) => queryFn(q, collections));
}
