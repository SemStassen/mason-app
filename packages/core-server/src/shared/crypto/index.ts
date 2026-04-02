import { ServiceMap } from "effect";
import type { Effect } from "effect";

export interface CryptoShape {
  readonly encrypt: (payload: string) => Effect.Effect<string>;
  readonly decrypt: (encryptedPayload: string) => Effect.Effect<string>;
  readonly hash: (str: string) => string;
}

export class Crypto extends ServiceMap.Service<Crypto, CryptoShape>()(
  "@recount/shared/Crypto"
) {}
