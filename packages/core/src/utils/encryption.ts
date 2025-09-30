import crypto from "crypto";
import { Config, Effect, Schema } from "effect";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export class EncryptionError extends Schema.TaggedError<EncryptionError>()(
  "@mason/core/EncryptionError",
  {
    cause: Schema.Unknown,
  }
) {}

export const getKey = () =>
  Effect.gen(function* () {
    const key = yield* Config.string("ENCRYPTION_KEY");

    if (Buffer.from(key, "hex").length !== 32) {
      return yield* Effect.fail(
        new EncryptionError({
          cause: "ENCRYPTION_KEY must be a 64-character hex string (32 bytes).",
        })
      );
    }

    return Buffer.from(key, "hex");
  }).pipe(
    Effect.catchTags({
      ConfigError: (error) => Effect.die(error),
      "@mason/core/EncryptionError": (error) => Effect.die(error),
    })
  );

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * @param payload The plaintext string to encrypt.
 * @returns A string containing the IV, auth tag, and encrypted text, concatenated and base64 encoded.
 */
export const encrypt = (payload: string) =>
  Effect.gen(function* () {
    const key = yield* getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(payload, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Concatenate IV, auth tag, and encrypted data
    const encryptedPayload = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, "hex"),
    ]).toString("base64");

    return encryptedPayload;
  });

/**
 * Decrypts an AES-256-GCM encrypted string.
 * @param encryptedPayload The base64 encoded string containing the IV, auth tag, and encrypted text.
 * @returns The original plaintext string.
 */
export const decrypt = (encryptedPayload: string) =>
  Effect.gen(function* () {
    const key = yield* getKey();
    const dataBuffer = Buffer.from(encryptedPayload, "base64");

    const iv = dataBuffer.subarray(0, IV_LENGTH);
    const authTag = dataBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encryptedText = dataBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(
      encryptedText.toString("hex"),
      "hex",
      "utf8"
    );
    decrypted += decipher.final("utf8");

    return decrypted;
  });

export function hash(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}
