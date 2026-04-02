import { RecountApi } from "@recount/core/http";
import { Layer } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { PingHttpGroupLayer } from "./routes/ping";

export const HttpApiRoutesLayer = HttpApiBuilder.layer(RecountApi).pipe(
  Layer.provide(PingHttpGroupLayer)
);
