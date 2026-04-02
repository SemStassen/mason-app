import { Effect, Schema } from "effect";

export class InvalidFrontendOriginsError extends Schema.TaggedErrorClass<InvalidFrontendOriginsError>()(
  "InvalidFrontendOriginsError",
  {
    message: Schema.String,
  }
) {}

export const parseOrigins = (rawOrigins: string) =>
  Effect.gen(function* () {
    const origins = [
      ...new Set(
        rawOrigins
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      ),
    ];

    if (origins.length === 0) {
      return yield* new InvalidFrontendOriginsError({
        message: "FRONTEND_ORIGINS must include at least one origin",
      });
    }

    return yield* Effect.all(
      origins.map((rawOrigin) =>
        Effect.gen(function* () {
          const url = yield* Schema.decodeUnknownEffect(Schema.URLFromString)(
            rawOrigin
          ).pipe(
            Effect.mapError(
              () =>
                new InvalidFrontendOriginsError({
                  message: `Invalid origin in FRONTEND_ORIGINS: ${rawOrigin}`,
                })
            )
          );

          if (url.host.length === 0) {
            return yield* new InvalidFrontendOriginsError({
              message: `Origin must include a host: ${rawOrigin}`,
            });
          }

          if (url.pathname !== "" && url.pathname !== "/") {
            return yield* new InvalidFrontendOriginsError({
              message: `Origin must not include a path: ${rawOrigin}`,
            });
          }

          if (url.search.length > 0) {
            return yield* new InvalidFrontendOriginsError({
              message: `Origin must not include query parameters: ${rawOrigin}`,
            });
          }

          if (url.hash.length > 0) {
            return yield* new InvalidFrontendOriginsError({
              message: `Origin must not include a hash fragment: ${rawOrigin}`,
            });
          }

          return `${url.protocol}//${url.host}`;
        })
      )
    );
  });
