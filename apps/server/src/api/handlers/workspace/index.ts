import { HttpApiBuilder, HttpServerResponse } from '@effect/platform';
import { Effect } from 'effect';
import { MasonApi } from '~/api/contract';
import { InternalServerError } from '~/api/contract/error';

export const WorkspaceGroupLive = HttpApiBuilder.group(
  MasonApi,
  'Workspace',
  (handlers) =>
    Effect.gen(function* () {
      return handlers.handle('CreateWorkspace', () =>
        Effect.gen(function* () {
          return yield* HttpServerResponse.empty();
        }).pipe(
          Effect.mapError(
            () =>
              new InternalServerError({
                code: 'INTERNAL_SERVER_ERROR',
                status: 500,
                message: 'Auth error',
              })
          )
        )
      );
    })
);
