import type { Activity, Project, TimeEntry } from "@mason/db/schema";
import { createFileRoute } from "@tanstack/react-router";
import { Tracker } from "~/components/tracker";
import { getPGliteConnection } from "~/lib/db";
import { rootStore } from "~/stores/root-store";

export const Route = createFileRoute("/$workspaceSlug/_app-layout/tracker")({
  loader: async ({ abortController }) => {
    const pg = await getPGliteConnection();
    const liveTimeEntries = pg.live.query<
      TimeEntry & {
        activity: Pick<Activity, "name"> & {
          project: Pick<Project, "name" | "hex_color">;
        };
      }
    >({
      query: `
        SELECT 
          time_entries.*,
          json_build_object(
            'name', activities.name,
            'project', json_build_object(
              'name', projects.name,
              'hex_color', projects.hex_color
            )
          ) as activity
        FROM time_entries
        INNER JOIN activities ON time_entries.activity_id = activities.id
        INNER JOIN projects ON activities.project_id = projects.id
        WHERE time_entries.user_id = $1
      `,
      params: [rootStore.appStore.userId],
      signal: abortController.signal,
      offset: 0,
      limit: 100,
    });

    return { liveTimeEntries };
  },
  component: Tracker,
});
