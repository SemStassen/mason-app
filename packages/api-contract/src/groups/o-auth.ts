import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';

export const OAuthGroup = HttpApiGroup.make('OAuth')
  .add(
    HttpApiEndpoint.post('SignInWithGoogle')`/google`
      .setPayload(
        Schema.Struct({
          platform: Schema.Literal('web', 'desktop'),
        })
      )
      .addSuccess(
        Schema.Struct({
          url: Schema.String,
        })
      )
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.get('GoogleCallback')`/google/callback`
      .addSuccess(Schema.Struct({}))
      .addError(HttpApiError.InternalServerError)
  );
