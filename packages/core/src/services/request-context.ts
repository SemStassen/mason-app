import { Effect } from "effect";

export class RequestContextService extends Effect.Service<RequestContextService>()(
  "@mason/RequestContextService",
  {
    // biome-ignore lint/correctness/useYield: Will do later
    effect: Effect.gen(function* () {
      return {
        workspaceId: "0199196e-a55a-7b34-840b-d1657d0ee707",
      };
    }),
  }
) {}
