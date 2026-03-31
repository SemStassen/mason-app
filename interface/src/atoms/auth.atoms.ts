import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";

import { MasonAtomRpcClient } from "~/lib/rpc/atom-client";

import { atomRuntime } from "./runtime";

export const sessionAtom = atomRuntime
  .atom(
    Effect.gen(function* () {
      const client = yield* MasonAtomRpcClient;

      return yield* client("Auth.GetSession", undefined);
    })
  )
  .pipe(Atom.keepAlive);

export const workspacesAtom = atomRuntime
  .atom(
    Effect.gen(function* () {
      const client = yield* MasonAtomRpcClient;

      return yield* client("Workspace.List", undefined);
    })
  )
  .pipe(Atom.keepAlive);
