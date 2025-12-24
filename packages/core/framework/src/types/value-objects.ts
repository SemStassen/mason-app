import { Schema } from "effect";
import { regex } from "../utils/regex";

export type PlainApiKey = typeof PlainApiKey.Type;
export const PlainApiKey = Schema.Redacted(
  Schema.NonEmptyString.pipe(Schema.brand("PlainApiKey"))
);

export type EncryptedApiKey = typeof EncryptedApiKey.Type;
export const EncryptedApiKey = Schema.Redacted(
  Schema.NonEmptyString.pipe(Schema.brand("EncryptedApiKey"))
);

export type HexColor = typeof HexColor.Type;
export const HexColor = Schema.NonEmptyString.pipe(
  Schema.pattern(regex.hexColor),
  Schema.brand("HexColor")
);
