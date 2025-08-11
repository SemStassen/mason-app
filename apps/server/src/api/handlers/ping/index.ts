import { HttpApiBuilder, HttpServerResponse } from '@effect/platform';
import { Effect } from 'effect';
import { MasonApi } from '~/api/contract';

export const PingGroupLive = HttpApiBuilder.group(
  MasonApi,
  'Ping',
  (handlers) =>
    Effect.gen(function* () {
      return handlers.handle('Ping', () =>
        Effect.gen(function* () {
          return yield* HttpServerResponse.text('pong');
        })
      );
    })
);
