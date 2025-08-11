import { HttpApiEndpoint, HttpApiGroup } from '@effect/platform';
import { Schema } from 'effect';
import { regex } from '~/utils/regex';
import { InternalServerError } from '../error';

export const AuthGroup = HttpApiGroup.make('Auth')
  .add(
    HttpApiEndpoint.post('SendEmailVerificationOTP')`/email-otp`
      .setPayload(
        Schema.Struct({
          email: Schema.String.pipe(Schema.pattern(regex.email)),
          type: Schema.Literal(
            'sign-in',
            'email-verification',
            'forget-password'
          ),
        })
      )
      .addSuccess(Schema.Struct({}))
      .addError(InternalServerError)
  )
  .add(
    HttpApiEndpoint.post('SignInWithEmailOTP')`/verify-email`
      .setPayload(
        Schema.Struct({
          email: Schema.String.pipe(Schema.pattern(regex.email)),
          otp: Schema.String,
        })
      )
      .addSuccess(Schema.Struct({}))
      .addError(InternalServerError)
  )
  .add(
    HttpApiEndpoint.post('SignInWithGithub')`/github`
      .addSuccess(Schema.Struct({}))
      .addError(InternalServerError)
  );
