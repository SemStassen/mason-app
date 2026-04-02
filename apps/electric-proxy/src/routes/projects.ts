import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import {
  HttpSessionMiddleware,
  HttpWorkspaceMiddleware,
} from "@recount/core-server/shared/middleware";
import { WorkspaceContext } from "@recount/core/shared/auth";
import { Cause, Config, Effect, Layer, Option, Stream } from "effect";
import { Headers, HttpRouter, HttpServerResponse } from "effect/unstable/http";
import { HttpApiError } from "effect/unstable/httpapi";

const electricConfig = Config.all({
  electricUrl: Config.string("ELECTRIC_URL"),
  sourceId: Config.string("ELECTRIC_SOURCE_ID").pipe(Config.option),
  sourceSecret: Config.string("ELECTRIC_SOURCE_SECRET").pipe(Config.option),
});

export const ProjectsRouteLayer = HttpRouter.add(
  "GET",
  "/projects",
  (request) =>
    Effect.gen(function* () {
      const workspaceContext = yield* WorkspaceContext;
      const { electricUrl, sourceId, sourceSecret } = yield* electricConfig;

      const requestUrl = new URL(request.url, "http://localhost");
      const originUrl = new URL("/v1/shape", electricUrl);

      // Forward only Electric protocol parameters from the client.
      // This avoids clients overriding server-controlled values like table/where.
      for (const [key, value] of requestUrl.searchParams.entries()) {
        if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
          originUrl.searchParams.set(key, value);
        }
      }
      Option.map(sourceId, (id) => originUrl.searchParams.set("source_id", id));
      Option.map(sourceSecret, (secret) =>
        originUrl.searchParams.set("secret", secret)
      );

      originUrl.searchParams.set("table", "projects");
      // Apply row-level security
      originUrl.searchParams.set(
        "where",
        `workspace_id = '${workspaceContext.workspace.id}'`
      );

      // We use raw fetch instead of Effect's HttpClient because HttpClient eagerly
      // locks the response body's ReadableStream before we can proxy it as a stream.
      const response = yield* Effect.tryPromise({
        try: () => fetch(originUrl.toString()),
        catch: () => new HttpApiError.InternalServerError(),
      });

      // Upstream fetch may already be decompressed; stale encoding/length headers
      // can break browser decoding for streamed proxy responses.
      const responseHeaders = Headers.set(
        Headers.removeMany(
          Headers.fromInput(Object.fromEntries(response.headers.entries())),
          ["content-encoding", "content-length"]
        ),
        "vary",
        "Authorization, Cookie"
      );

      return HttpServerResponse.stream(
        Stream.fromReadableStream({
          evaluate: () => response.body!,
          onError: (e) => new Cause.UnknownError(e),
        }),
        {
          status: response.status,
          headers: responseHeaders,
        }
      );
    })
).pipe(
  Layer.provide([HttpSessionMiddleware.layer, HttpWorkspaceMiddleware.layer])
);
