import { Layer, ManagedRuntime } from "effect";
import { Atom } from "effect/unstable/reactivity";

import { RecountApiClient } from "./api/client";
import { RecountAtomRpcClient } from "./rpc/atom-client";
import { TracerLayer } from "./telemetry";

export const runtimeLayer = Layer.mergeAll(
  RecountApiClient.layer,
  RecountAtomRpcClient.layer,
  TracerLayer
);

/**
 * Managed runtime for imperative Effect execution
 *
 * Uses Atom.defaultMemoMap to ensure layer memoization is shared with
 * Atom.runtime() calls. This prevents duplicate WebSocket connections by
 * ensuring both the ManagedRuntime (for collections) and AtomRuntime (for
 * mutations) build layers with the same MemoMap, allowing Effect to reuse
 * already-built layer instances.
 *
 * Used by collections.ts and other imperative code that calls runtime.runPromise().
 */
export const runtime = ManagedRuntime.make(runtimeLayer, {
  memoMap: Atom.defaultMemoMap,
});
