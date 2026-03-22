import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

export class PingHttpGroup extends HttpApiGroup.make("ping").add(
  HttpApiEndpoint.get("ping", "/ping", {
    success: Schema.Struct({
      status: Schema.Literal("OK"),
      timestamp: Schema.DateTimeUtc,
    }),
  })
) {}
