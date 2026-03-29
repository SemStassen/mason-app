import { Atom } from "effect/unstable/reactivity";

import { runtimeLayer } from "~/lib/runtime";

export const atomRuntime = Atom.runtime(runtimeLayer);
