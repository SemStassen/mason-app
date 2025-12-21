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
import { Config, Effect, Schema } from "effect";
import { WorkspaceId } from "../models/ids";
import { DatabaseService } from "./db.service";

export class BetterAuthError extends Schema.TaggedError<BetterAuthError>()(
  "@mason/server/betterAuthError",
  {
    cause: Schema.Unknown,
  }
) {}

export class AuthService extends Effect.Service<AuthService>()(
  "@mason/server/authService",
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
        databaseHooks: {
          session: {
            create: {
              before: async (session) => {
                const user = await Effect.runPromise(
                  db.use(null, (conn) =>
                    conn.query.usersTable.findFirst({
                      where: (fields, { eq }) => eq(fields.id, session.userId),
                      with: {
                        memberships: true,
                        sessions: {
                          orderBy: (fields, { desc }) => [
                            desc(fields.createdAt),
                          ],
                          limit: 1,
                        },
                      },
                    })
                  )
                );

                return {
                  data: {
                    ...session,
                    activeOrganizationId:
                      user?.sessions?.[0]?.activeWorkspaceId ||
                      user?.memberships?.[0]?.workspaceId ||
                      null,
                  },
                };
              },
            },
          },
        },
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
            prompt: "select_account consent",
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
        // We don't actually use sessions. We use bearer tokens (access tokens)
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
          bearer({
            requireSignature: true,
          }),
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
          customSession(
            ({ session }) =>
              Effect.runPromise(
                Effect.gen(function* () {
                  // Always fetch user baseline without tenant RLS
                  const baseUser = yield* db.use(null, (conn) =>
                    conn.query.usersTable.findFirst({
                      where: (userFields, { eq }) =>
                        eq(userFields.id, session.userId),
                      with: { memberships: true },
                    })
                  );


                  if (!baseUser) {
                    return yield* Effect.fail(
                      new BetterAuthError({ cause: "User not found" })
                    );
                  }

                  const { activeOrganizationId, ...newSession } = session;

                  // Decide active workspace
                  const activeWorkspaceId =
                    activeOrganizationId ??
                    baseUser.memberships[0]?.workspaceId ??
                    null;

                  if (!activeWorkspaceId) {
                    // No workspace memberships at all → onboarding case
                    return {
                      // Narrow the type for memberships
                      user: { ...baseUser, memberships: [] },
                      session: { ...newSession, activeWorkspaceId: null },
                    };
                  }

                  // Refetch user with RLS in place
                  const userWithWorkspaces = yield* db.use(
                    WorkspaceId.make(activeWorkspaceId),
                    (conn) =>
                      conn.query.usersTable.findFirst({
                        where: (userFields, { eq }) =>
                          eq(userFields.id, baseUser.id),
                        with: {
                          memberships: { with: { workspace: true } },
                        },
                      })
                  );

                  if (!userWithWorkspaces) {
                    return yield* Effect.fail(
                      new BetterAuthError({
                        cause: "User not found in workspace",
                      })
                    );
                  }

                  return {
                    user: userWithWorkspaces,
                    session: { ...newSession, activeWorkspaceId },
                  };
                })
              ),
            betterAuthOptions
          ),
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
        headersToObject: (headers: Headers) => {
          const headersObject: Record<string, string> = {};
          headers.forEach((value, key) => {
            headersObject[key] = value;
          });
          return headersObject;
        },
      } as const;
    }).pipe(Effect.catchTags({ ConfigError: (error) => Effect.die(error) })),
  }
) {}
