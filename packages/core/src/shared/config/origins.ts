import { Effect, Schema } from "effect";

export class InvalidFrontendOriginsError extends Schema.TaggedErrorClass<InvalidFrontendOriginsError>()(
  "InvalidFrontendOriginsError",
  {
    message: Schema.String,
  }
) {}

const isWildcardOriginPattern = (origin: string) => origin.includes("*");

const wildcardOriginPatternRegex =
  /^(https?):\/\/([A-Za-z0-9-]+)\*\.([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*)(?::(\d+))?$/i;

const escapeRegex = (value: string) =>
  value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");

export const matchesAllowedOrigin = (
  origin: string,
  patterns: ReadonlyArray<string>
) =>
  patterns.some((pattern) => {
    if (!isWildcardOriginPattern(pattern)) {
      return origin === pattern;
    }

    const patternMatch = pattern.match(wildcardOriginPatternRegex);

    if (!patternMatch) {
      return false;
    }

    const [, protocol, prefix, hostname, port] = patternMatch;
    const regex = new RegExp(
      `^${protocol}:\\/\\/${escapeRegex(prefix)}[^.]+\\.${escapeRegex(hostname)}${port === undefined ? "" : `:${port}`}$`,
      "i"
    );

    return regex.test(origin);
  });

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
          if (rawOrigin.includes("?")) {
            return yield* new InvalidFrontendOriginsError({
              message: `Origin patterns must not include ?: ${rawOrigin}`,
            });
          }

          if (rawOrigin.includes("#")) {
            return yield* new InvalidFrontendOriginsError({
              message: `Origin patterns must not include a hash fragment: ${rawOrigin}`,
            });
          }

          if (rawOrigin.includes("/", rawOrigin.indexOf("://") + 3)) {
            return yield* new InvalidFrontendOriginsError({
              message: `Origin patterns must not include a path: ${rawOrigin}`,
            });
          }

          if (isWildcardOriginPattern(rawOrigin)) {
            const wildcardMatch = rawOrigin.match(wildcardOriginPatternRegex);

            if (!wildcardMatch) {
              return yield* new InvalidFrontendOriginsError({
                message: `Invalid origin pattern in FRONTEND_ORIGINS: ${rawOrigin}`,
              });
            }

            const wildcardUrl = yield* Effect.try({
              try: () => new URL(rawOrigin.replace("*", "preview")),
              catch: () =>
                new InvalidFrontendOriginsError({
                  message: `Invalid origin pattern in FRONTEND_ORIGINS: ${rawOrigin}`,
                }),
            });

            if (
              wildcardUrl.protocol !== "http:" &&
              wildcardUrl.protocol !== "https:"
            ) {
              return yield* new InvalidFrontendOriginsError({
                message: `Wildcard origin patterns must use http or https: ${rawOrigin}`,
              });
            }

            if (
              wildcardUrl.username.length > 0 ||
              wildcardUrl.password.length > 0
            ) {
              return yield* new InvalidFrontendOriginsError({
                message: `Origin patterns must not include credentials: ${rawOrigin}`,
              });
            }

            const [, protocol, prefix, hostname, port] = wildcardMatch;

            return `${protocol}://${prefix}*.${hostname}${port === undefined ? "" : `:${port}`}`;
          }

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

          if (
            url.protocol !== "http:" &&
            url.protocol !== "https:" &&
            url.protocol !== "tauri:"
          ) {
            return yield* new InvalidFrontendOriginsError({
              message: `Origin must use http, https, or tauri: ${rawOrigin}`,
            });
          }

          if (url.username.length > 0 || url.password.length > 0) {
            return yield* new InvalidFrontendOriginsError({
              message: `Origin must not include credentials: ${rawOrigin}`,
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
