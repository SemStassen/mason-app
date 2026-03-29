import { scheduleTask } from "@effect/atom-react";
import { AtomRegistry } from "effect/unstable/reactivity";

import { atomRuntime } from "./runtime";

export const atomRegistry = AtomRegistry.make({ scheduleTask });

atomRegistry.mount(atomRuntime);
