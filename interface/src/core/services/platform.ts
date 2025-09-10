import { Context, Data, Layer } from "effect";
import type { Platform } from "~/utils/platform";

export class PlatformError extends Data.TaggedError("PlatformError")<{
  readonly cause: unknown;
}> {}

// This is set in the web and desktop apps respectively.
// That way we can avoid using other patterns such as react context.
// And stay within the effect runtime
export class PlatformService extends Context.Tag(
  "@mason/interface/PlatformService"
)<PlatformService, Platform>() {
  static live(platform: Platform) {
    return Layer.succeed(PlatformService, platform);
  }
}
