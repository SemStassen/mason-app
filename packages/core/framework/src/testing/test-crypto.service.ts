import { Effect, Layer } from "effect";
import { CryptoService } from "../platform/crypto/crypto.service.ts";

export const TestCryptoService = Layer.succeed(
  CryptoService,
  CryptoService.of({
    encrypt: (payload: string) =>
      Effect.sync(() => Buffer.from(payload).toString("base64")),

    decrypt: (encryptedPayload: string) =>
      Effect.sync(() =>
        Buffer.from(encryptedPayload, "base64").toString("utf-8")
      ),

    hash: (str: string) => {
      // Simple deterministic hash for testing
      return Buffer.from(str).toString("base64").slice(0, 16);
    },
  })
);
