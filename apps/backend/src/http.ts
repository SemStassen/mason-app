import { MasonApi } from "@mason/core/http";
import { Layer } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { PingHttpGroupLayer } from "./routes/ping";

export const HttpApiRoutesLayer = HttpApiBuilder.layer(MasonApi).pipe(
  Layer.provide(PingHttpGroupLayer)
);
