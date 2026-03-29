import { Effect, ServiceMap } from "effect";

interface PlatformShape {
  getBearerToken: () => Effect.Effect<string>;
  storeBearerToken: () => Effect.Effect<string>;
}

export class Platform extends ServiceMap.Service<Platform, PlatformShape>()(
  "@mason/interface/lib/platform"
) {
  readonly static webLayer = Effect.
}
