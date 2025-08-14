import { eq } from '@mason/db/operators';
// biome-ignore lint/performance/noNamespaceImport: Needed for schema
import * as schema from '@mason/db/schema';
import { type BetterAuthOptions, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { customSession, emailOTP, organization } from 'better-auth/plugins';
import { Config, Data, Effect } from 'effect';
import { DatabaseService } from './db';

export class BetterAuthError extends Data.TaggedError('BetterAuthError')<{
  readonly cause: unknown;
}> {}

export class AuthService extends Effect.Service<AuthService>()(
  '@mason/AuthService',
  {
    effect: Effect.gen(function* () {
      const AuthConfig = Config.all({
        githubClientId: Config.string('GITHUB_CLIENT_ID'),
        githubClientSecret: Config.string('GITHUB_CLIENT_SECRET'),
      });

      const authConfig = yield* AuthConfig;

      const db = yield* DatabaseService;

      // This is required for the type inference to work in the customSession plugin
      const betterAuthOptions = {
        appName: 'Mason',
        database: drizzleAdapter(db._drizzle, {
          provider: 'pg',
          schema: schema,
        }),
        trustedOrigins: ['http://localhost:8002', 'http://localhost:8001'],
        advanced: {
          database: {
            generateId: false,
          },
          cookiePrefix: 'mason',
        },
        // Auth methods
        emailAndPassword: {
          enabled: true,
        },
        socialProviders: {
          github: {
            clientId: authConfig.githubClientId,
            clientSecret: authConfig.githubClientSecret,
          },
        },
        // Schema
        user: {
          modelName: 'usersTable',
          fields: {
            image: 'imageUrl',
            name: 'displayName',
          },
        },
        session: {
          cookieCache: {
            enabled: true,
            maxAge: 4 * 60 * 60,
          },
          updateAge: 2 * 60 * 60,
          modelName: 'sessionsTable',
          fields: {
            token: 'sessionToken',
          },
        },
        account: {
          modelName: 'accountsTable',
        },
        verification: {
          modelName: 'verificationsTable',
        },
        plugins: [
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
                modelName: 'workspacesTable',
                fields: {
                  logo: 'logoUrl',
                },
              },
              member: {
                modelName: 'membersTable',
                fields: {
                  organizationId: 'workspaceId',
                },
              },
              invitation: {
                modelName: 'invitationsTable',
                fields: {
                  organizationId: 'workspaceId',
                },
              },
              session: {
                fields: {
                  activeOrganizationId: 'activeWorkspaceId',
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
          customSession(async ({ user, session }) => {
            return await Effect.runPromise(
              Effect.gen(function* () {
                yield db.use((conn) =>
                  conn.query.usersTable.findFirst({
                    where: eq(schema.usersTable.id, user.id),
                  })
                );

                return { user, session };
              })
            );
          }, betterAuthOptions),
        ],
      });

      const use = Effect.fn('AuthService.use')(
        <A>(
          fn: (
            client: typeof betterAuthClient,
            signal: AbortSignal
          ) => Promise<A>
        ): Effect.Effect<A, BetterAuthError> =>
          Effect.tryPromise({
            try: (signal) => {
              return fn(betterAuthClient, signal);
            },
            catch: (cause) => new BetterAuthError({ cause }),
          })
      );

      return {
        use,
      } as const;
    }),
  }
) {}
