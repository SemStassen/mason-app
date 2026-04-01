import { getAllowedOrigins } from "@mason/core/shared/config";
import { Email } from "@mason/core/shared/schemas";
import { Database, schema } from "@mason/db";
import { Mailer } from "@mason/notifications/mailer";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, emailOTP } from "better-auth/plugins";
import { Config, Effect, Layer, Schema, ServiceMap } from "effect";

const trustedOrigins = getAllowedOrigins(process.env.FRONTEND_ORIGINS);

export class BetterAuthError extends Schema.TaggedErrorClass<BetterAuthError>()(
  "auth/BetterAuthError",
  {
    cause: Schema.Unknown,
  }
) {}

export class BetterAuth extends ServiceMap.Service<BetterAuth>()(
  "@mason/auth/BetterAuth",
  {
    make: Effect.gen(function* () {
      const authConfig = yield* Config.all({
        betterAuthSecret: Config.string("BETTER_AUTH_SECRET"),
        googleClientId: Config.string("GOOGLE_CLIENT_ID"),
        googleClientSecret: Config.string("GOOGLE_CLIENT_SECRET"),
      });

      const db = yield* Database;
      const mailer = yield* Mailer;

      const services = yield* Effect.services<Database | Mailer>();
      const runPromise = Effect.runPromiseWith(services);

      const betterAuthClient = betterAuth({
        appName: "Mason",
        secret: authConfig.betterAuthSecret,
        database: drizzleAdapter(db.unsafeDrizzle, {
          provider: "pg",
          schema: schema,
        }),
        trustedOrigins,
        advanced: {
          database: {
            generateId: false,
          },
          cookiePrefix: "mason",
        },
        emailAndPassword: {
          enabled: true,
        },
        socialProviders: {
          google: {
            clientId: authConfig.googleClientId,
            clientSecret: authConfig.googleClientSecret,
            accessType: "offline",
            prompt: "select_account consent",
          },
        },
        user: {
          modelName: "usersTable",
          fields: {
            image: "imageUrl",
            name: "fullName",
          },
        },
        session: {
          storeSessionInDatabase: false,
          modelName: "sessionsTable",
          fields: {
            token: "sessionToken",
          },
        },
        account: {
          modelName: "accountsTable",
        },
        verification: {
          modelName: "verificationsTable",
        },
        plugins: [
          bearer({
            requireSignature: true,
          }),
          emailOTP({
            sendVerificationOTP: ({ email: rawEmail, otp, type }) =>
              runPromise(
                Effect.gen(function* () {
                  const email = Email.makeUnsafe(rawEmail);

                  switch (type) {
                    case "sign-in": {
                      return yield* mailer.sendSignInOtp({ email, otp });
                    }
                    case "email-verification": {
                      return yield* mailer.sendEmailVerificationOtp({
                        email,
                        otp,
                      });
                    }
                    case "forget-password": {
                      return yield* mailer.sendPasswordResetOtp({
                        email,
                        otp,
                      });
                    }
                    default: {
                      return yield* new BetterAuthError({
                        cause: new Error(
                          `Unsupported OTP type: ${String(type)}`
                        ),
                      });
                    }
                  }
                })
              ),
          }),
        ],
      });

      return {
        use: Effect.fn("AuthService.use")(
          <A>(
            fn: (client: typeof betterAuthClient) => Promise<A>
          ): Effect.Effect<A, BetterAuthError> =>
            Effect.tryPromise({
              try: () => fn(betterAuthClient),
              catch: (cause) => new BetterAuthError({ cause }),
            })
        ),
      };
    }),
  }
) {
  static readonly layer = Layer.effect(BetterAuth, BetterAuth.make);
}
