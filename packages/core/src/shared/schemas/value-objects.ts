import { Schema } from "effect";
import { regex } from "~/shared/utils";

export type JsonRecord = typeof JsonRecord.Type;
export const JsonRecord = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
});

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

export type Email = typeof Email.Type;
export const Email = Schema.NonEmptyString.pipe(
  Schema.pattern(regex.email),
  Schema.brand("Email")
);

export type WorkspaceRole = typeof WorkspaceRole.Type;
export const WorkspaceRole = Schema.Literal("owner");
