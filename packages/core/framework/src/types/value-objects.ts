import { Schema } from "effect";
import { regex } from "../utils/regex";

export type PlainApiKey = typeof PlainApiKey.Type;
export const PlainApiKey = Schema.NonEmptyString.pipe(
  Schema.brand("ApiKey"),
  Schema.Redacted
);

export type EncryptedApiKey = typeof EncryptedApiKey.Type;
export const EncryptedApiKey = Schema.NonEmptyString.pipe(
  Schema.brand("EncryptedApiKey"),
  Schema.Redacted
);

export type HexColor = typeof HexColor.Type;
export const HexColor = Schema.NonEmptyString.pipe(
  Schema.pattern(regex.hexColor),
  Schema.brand("HexColor")
);
