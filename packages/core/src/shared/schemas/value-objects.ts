import { Schema } from "effect";

import { regex } from "#shared/utils/index";

export type PlainApiKey = typeof PlainApiKey.Type;
export const PlainApiKey = Schema.Redacted(Schema.NonEmptyString).pipe(
  Schema.brand("PlainApiKey")
);

export type EncryptedApiKey = typeof EncryptedApiKey.Type;
export const EncryptedApiKey = Schema.Redacted(Schema.NonEmptyString).pipe(
  Schema.brand("EncryptedApiKey")
);

export type HexColor = typeof HexColor.Type;
export const HexColor = Schema.NonEmptyString.check(
  Schema.isPattern(regex.hexColor)
).pipe(Schema.brand("HexColor"));

export type Email = typeof Email.Type;
export const Email = Schema.NonEmptyString.check(
  Schema.isPattern(regex.email)
).pipe(Schema.brand("Email"));
