import type { TimeEntry } from "@mason/db/schema";
import { createFileRoute } from "@tanstack/react-router";
import { Tracker } from "~/components/tracker";
import { getPGliteConnection } from "~/lib/db";
import { rootStore } from "~/stores/root-store";

export const Route = createFileRoute("/tracker/")({
  loader: async ({ abortController }) => {
    const pg = await getPGliteConnection();
    const liveTimeEntries = pg.live.query<TimeEntry>({
      query: "SELECT * FROM time_entries where user_uuid = $1",
      params: [rootStore.appStore.userUuid],
      signal: abortController.signal,
      offset: 0,
      limit: 100,
    });

    return { liveTimeEntries };
  },
  component: Tracker,
});
