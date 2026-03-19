import { Buffer } from "node:buffer";
import crypto from "node:crypto";

import { Config, Effect, Layer } from "effect";

import { Crypto } from "#shared/crypto/index";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

const getKey = Effect.gen(function* () {
  const key = yield* Config.string("ENCRYPTION_KEY");

  if (Buffer.from(key, "hex").length !== 32) {
    return yield* Effect.die(
      "ENCRYPTION_KEY must be a 64-character hex string (32 bytes)."
    );
  }

  return Buffer.from(key, "hex");
}).pipe(
  Effect.catchTags({
    ConfigError: (error) => Effect.die(error),
  })
);

export const CryptoLayer = Layer.effect(
  Crypto,
  Effect.gen(function* () {
    const key = yield* getKey;

    return {
      encrypt: (payload) =>
        Effect.sync(() => {
          const iv = crypto.randomBytes(IV_LENGTH);
          const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

          let encrypted = cipher.update(payload, "utf8", "hex");
          encrypted += cipher.final("hex");

          const authTag = cipher.getAuthTag();

          return Buffer.concat([
            iv,
            authTag,
            Buffer.from(encrypted, "hex"),
          ]).toString("base64");
        }),

      decrypt: (encryptedPayload) =>
        Effect.sync(() => {
          const dataBuffer = Buffer.from(encryptedPayload, "base64");

          const iv = dataBuffer.subarray(0, IV_LENGTH);
          const authTag = dataBuffer.subarray(
            IV_LENGTH,
            IV_LENGTH + AUTH_TAG_LENGTH
          );
          const encryptedText = dataBuffer.subarray(
            IV_LENGTH + AUTH_TAG_LENGTH
          );

          const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
          decipher.setAuthTag(authTag);

          let decrypted = decipher.update(
            encryptedText.toString("hex"),
            "hex",
            "utf8"
          );
          decrypted += decipher.final("utf8");

          return decrypted;
        }),

      hash: (str) => crypto.createHash("sha256").update(str).digest("hex"),
    };
  })
);
