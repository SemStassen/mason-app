import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import {
  HttpSessionMiddleware,
  HttpWorkspaceMiddleware,
} from "@mason/core-server/shared/middleware";
import { WorkspaceContext } from "@mason/core/shared/auth";
import { Config, Effect, Layer, Option, Schema } from "effect";
import {
  Headers,
  HttpClient,
  HttpRouter,
  HttpServerResponse,
} from "effect/unstable/http";

const electricConfig = Config.all({
  electricUrl: Config.string("ELECTRIC_URL"),
  sourceId: Config.string("ELECTRIC_SOURCE_ID").pipe(Config.option),
  sourceSecret: Config.string("ELECTRIC_SOURCE_SECRET").pipe(Config.option),
});

const encodeJsonString = Schema.encodeSync(
  Schema.fromJsonString(Schema.String)
);

export const ProjectsRouteLayer = HttpRouter.add(
  "GET",
  "/projects",
  (request) =>
    Effect.gen(function* () {
      // Effect's request URL can be relative depending on runtime adapter.
      // Normalizing to an absolute URL keeps search-param handling consistent.
      const requestUrl = request.url.startsWith("http")
        ? new URL(request.url)
        : new URL(request.url, "http://localhost");

      const workspaceContext = yield* WorkspaceContext;

      const { electricUrl, sourceId, sourceSecret } = yield* electricConfig;

      const originUrl = new URL("/v1/shape", electricUrl);

      // Forward only Electric protocol parameters from the client.
      // This avoids clients overriding server-controlled values like table/where.
      for (const [key, value] of requestUrl.searchParams.entries()) {
        if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
          originUrl.searchParams.set(key, value);
        }
      }

      originUrl.searchParams.set("table", "projects");

      if (Option.isSome(sourceId)) {
        originUrl.searchParams.set("source_id", sourceId.value);
      }

      if (Option.isSome(sourceSecret)) {
        originUrl.searchParams.set("secret", sourceSecret.value);
      }

      // Apply row-level security
      originUrl.searchParams.set(
        "where",
        `"workspace_id" = ${encodeJsonString(workspaceContext.workspace.id)}`
      );

      const upstream = yield* HttpClient.get(originUrl);

      // Upstream fetch may already be decompressed; stale encoding/length headers
      // can break browser decoding for streamed proxy responses.
      const noEncoding = Headers.remove(upstream.headers, "content-encoding");
      const noLength = Headers.remove(noEncoding, "content-length");
      const vary = Option.match(Headers.get(noLength, "vary"), {
        onNone: () => "Authorization",
        onSome: (value) =>
          value.includes("Authorization") ? value : `${value}, Authorization`,
      });
      const headers = Headers.set(noLength, "vary", vary);

      return HttpServerResponse.stream(upstream.stream, {
        status: upstream.status,
        headers,
      });
    })
).pipe(
  Layer.provide([HttpSessionMiddleware.layer, HttpWorkspaceMiddleware.layer])
);
