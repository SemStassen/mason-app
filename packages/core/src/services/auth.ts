import { eq } from "@mason/db/operators";
// biome-ignore lint/performance/noNamespaceImport: Needed for schema
import * as schema from "@mason/db/schema";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  bearer,
  customSession,
  emailOTP,
  organization,
} from "better-auth/plugins";
import { Config, Data, Effect } from "effect";
import { DatabaseService } from "./db";

export class BetterAuthError extends Data.TaggedError("BetterAuthError")<{
  readonly cause: unknown;
}> {}

export class AuthService extends Effect.Service<AuthService>()(
  "@mason/AuthService",
  {
    effect: Effect.gen(function* () {
      const AuthConfig = Config.all({
        googleClientId: Config.string("GOOGLE_CLIENT_ID"),
        googleClientSecret: Config.string("GOOGLE_CLIENT_SECRET"),
      });

      const authConfig = yield* AuthConfig;

      const db = yield* DatabaseService;

      // This is required to be separate for the type inference to work in the customSession plugin
      const betterAuthOptions = {
        appName: "Mason",
        database: drizzleAdapter(db._drizzle, {
          provider: "pg",
          schema: schema,
        }),
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
        // Auth methods
        emailAndPassword: {
          enabled: true,
        },
        socialProviders: {
          google: {
            redirectURI: "http://localhost:8002/api/oauth/google/callback",
            clientId: authConfig.googleClientId,
            clientSecret: authConfig.googleClientSecret,
            accessType: "offline",
            prompt: "select_account+consent",
          },
        },
        // Schema
        user: {
          modelName: "usersTable",
          fields: {
            image: "imageUrl",
            name: "displayName",
          },
        },
        // We don't actually use sessions. We use bearer tokens (acces tokens)
        session: {
          storeSessionInDatabase: false,
          preserveSessionInDatabase: false,
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
          bearer(),
          emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
              return await Effect.runPromise(
                Effect.gen(function* () {
                  yield* Effect.log({ email, otp, type });
                })
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
        plugins: [
          ...betterAuthOptions.plugins,
          customSession(async ({ session }) => {
            const user = await Effect.runPromise(
              db.use((conn) =>
                conn.query.usersTable.findFirst({
                  where: eq(schema.usersTable.id, session.userId),
                  with: {
                    memberships: {
                      with: {
                        workspace: true,
                      },
                    },
                  },
                })
              )
            );

            const activeWorkspaceSlug =
              user?.memberships?.[0]?.workspace?.slug || null;

            return { user, session, activeWorkspaceSlug };
          }, betterAuthOptions),
        ],
      });

      const use = Effect.fn("AuthService.use")(
        <A>(
          fn: (
            client: typeof betterAuthClient,
            signal: AbortSignal
          ) => Promise<A>
        ): Effect.Effect<A, BetterAuthError> =>
          Effect.tryPromise({
            try: (signal) => fn(betterAuthClient, signal),
            catch: (cause) => new BetterAuthError({ cause }),
          })
      );
      return {
        use,
      } as const;
    }),
  }
) {}
