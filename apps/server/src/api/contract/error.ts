import { Schema } from 'effect';

export class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>()(
  'UnauthorizedError',
  {
    code: Schema.Literal('UNAUTHORIZED'),
    status: Schema.Literal(401),
    message: Schema.optional(Schema.String),
  }
) {}

export class ForbiddenError extends Schema.TaggedError<ForbiddenError>()(
  'ForbiddenError',
  {
    code: Schema.Literal('FORBIDDEN'),
    status: Schema.Literal(403),
    message: Schema.optional(Schema.String),
  }
) {}

export class NotFoundError extends Schema.TaggedError<NotFoundError>()(
  'NotFoundError',
  {
    code: Schema.Literal('NOT_FOUND'),
    status: Schema.Literal(404),
    message: Schema.optional(Schema.String),
  }
) {}

// Technically this should be InternalServerErrorError (:
export class InternalServerError extends Schema.TaggedError<InternalServerError>()(
  'InternalServerError',
  {
    code: Schema.Literal('INTERNAL_SERVER_ERROR'),
    status: Schema.Literal(500),
    message: Schema.optional(Schema.String),
  }
) {}
