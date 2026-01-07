import { type BetterAuthOptions, betterAuth } from "better-auth";
import { bearer, emailOTP, organization } from "better-auth/plugins";
import { Config, Effect, Runtime, Schema } from "effect";
import { DatabaseService } from "~/shared/db";
import { EmailService } from "../email";

export class BetterAuthError extends Schema.TaggedError<BetterAuthError>()(
  "shared/BetterAuthError",
  {
    cause: Schema.Unknown,
  }
) {}

export class AuthService extends Effect.Service<AuthService>()(
  "@mason/shared/AuthService",
  {
    effect: Effect.gen(function* () {
      const authConfig = yield* Config.all({
        googleClientId: Config.string("GOOGLE_CLIENT_ID"),
        googleClientSecret: Config.string("GOOGLE_CLIENT_SECRET"),
      });

      const db = yield* DatabaseService;
      const emailService = yield* EmailService;
      const runtime = yield* Effect.runtime();

      // This is required to be separate for the type inference to work in the customSession plugin
      const betterAuthOptions = {
        appName: "Mason",
        // database: drizzleAdapter(db.drizzle, {
        //   provider: "pg",
        //   schema: schema,
        // }),
        trustedOrigins: [
          "http://localhost:8001",
          "http://localhost:8002",
          "http://localhost:1420",
        ],
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
            redirectURI: "http://localhost:8002/api/oauth/google/callback",
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
            name: "displayName",
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
            sendVerificationOTP: async ({ email, otp, type }) => {
              await Runtime.runPromise(runtime)(
                emailService.sendVerificationOTP({ email, otp, type })
              );
            },
          }),
          organization({
            schema: {
              organization: {
                modelName: "workspacesTable",
                fields: {
                  logo: "logoUrl",
                },
              },
              member: {
                modelName: "membersTable",
                fields: {
                  organizationId: "workspaceId",
                },
              },
              invitation: {
                modelName: "invitationsTable",
                fields: {
                  organizationId: "workspaceId",
                },
              },
              session: {
                fields: {
                  activeOrganizationId: "activeWorkspaceId",
                },
              },
            },
          }),
        ],
      } satisfies BetterAuthOptions;

      const betterAuthClient = betterAuth({
        ...betterAuthOptions,
        plugins: [...betterAuthOptions.plugins],
      });

      const use = Effect.fn("AuthService.use")(
        <A>(
          fn: (client: typeof betterAuthClient) => Promise<A>
        ): Effect.Effect<A, BetterAuthError> =>
          Effect.tryPromise({
            try: () => fn(betterAuthClient),
            catch: (cause) => new BetterAuthError({ cause }),
          })
      );

      return { use } as const;
    }).pipe(Effect.catchTags({ ConfigError: (error) => Effect.die(error) })),
  }
) {}
