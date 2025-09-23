import { CreateProjectRequest } from "@mason/api-contract/dto/project.dto";
import { Data, Effect } from "effect";
import { TimeTrackingIntegrationService } from "../index";
import { stringToTiptapJSON } from "../utils";

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

export class FloatIntegrationError extends Data.TaggedError(
  "FloatIntegrationError"
)<{
  readonly cause: unknown;
}> {}

export const floatLive = TimeTrackingIntegrationService.of({
  listProjects: Effect.gen(function* () {
    const floatProjects: Array<FloatProject> = yield* Effect.tryPromise({
      try: () => fetch(`${BASE_URL}/projects`).then((res) => res.json()),
      catch: (e) => new FloatIntegrationError({ cause: e }),
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
});
