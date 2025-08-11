import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins';
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

      const betterAuthClient = betterAuth({
        appName: 'Mason',
        database: drizzleAdapter(db._drizzle, {
          provider: 'pg',
          usePlural: true,
        }),
        trustedOrigins: ['http://localhost:8002'],
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
          modelName: 'users',
          fields: {
            image: 'imageUrl',
          },
        },
        session: {
          cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
          },
          modelName: 'sessions',
          fields: {
            token: 'sessionToken',
          },
        },
        account: {
          modelName: 'accounts',
        },
        verification: {
          modelName: 'verifications',
        },
        plugins: [
          emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
              await console.log(email, otp, type);
            },
          }),
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
