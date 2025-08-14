import {
  HttpApiBuilder,
  HttpApiError,
  HttpServerResponse,
} from '@effect/platform';
import { Effect } from 'effect';
import { MasonApi } from '~/api/contract';

export const WorkspaceGroupLive = HttpApiBuilder.group(
  MasonApi,
  'Workspace',
  (handlers) =>
    Effect.gen(function* () {
      return handlers.handle('CreateWorkspace', () =>
        Effect.gen(function* () {
          return yield* HttpServerResponse.empty();
        }).pipe(Effect.mapError(() => new HttpApiError.InternalServerError()))
      );
    })
);
