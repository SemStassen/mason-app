import { parseOrigins } from "@mason/core/shared/config";
import { Config, Effect, Layer, ServiceMap } from "effect";

export interface BetterAuthConfigShape {
  secret: string;
  googleClientId: string;
  googleClientSecret: string;
  trustedOrigins: Array<string>;
}

export class BetterAuthConfig extends ServiceMap.Service<
  BetterAuthConfig,
  BetterAuthConfigShape
>()("@mason/auth/BetterAuthConfig") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function* () {
      const secret = yield* Config.string("BETTER_AUTH_SECRET");
      const googleClientId = yield* Config.string("GOOGLE_CLIENT_ID");
      const googleClientSecret = yield* Config.string("GOOGLE_CLIENT_SECRET");
      const frontendOrigins = yield* Config.string("FRONTEND_ORIGINS");

      const trustedOrigins = yield* parseOrigins(frontendOrigins);

      return {
        secret,
        googleClientId,
        googleClientSecret,
        trustedOrigins,
      };
    })
  );
}
