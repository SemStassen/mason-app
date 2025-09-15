import type { Api } from "@effect/platform/HttpApi";
import { Layer } from "effect";
import type { ConfigError } from "effect/ConfigError";
import { MasonApiLive } from "./api";
import { AuthService } from "./services/auth";
import { DatabaseService } from "./services/db";

export const MasonLive: Layer.Layer<Api, ConfigError, never> =
  MasonApiLive.pipe(
    Layer.provide(AuthService.Default),
    Layer.provide(DatabaseService.Default)
  );
