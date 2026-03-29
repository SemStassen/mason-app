import { startOfMinute } from "date-fns";
import { Atom } from "effect/unstable/reactivity";

import { atomRegistry } from "./registry";

const ONE_MINUTE_IN_MS = 60 * 1000;

export const currentTimeAtom = Atom.make(
  startOfMinute(new Date())
).pipe(Atom.keepAlive);

export function setCurrentTime(currentTime: Date) {
  atomRegistry.set(currentTimeAtom, startOfMinute(currentTime));
}

// Keep the app clock aligned to real minute boundaries while still allowing
// manual overrides through direct writes in dev tools.
(() => {
  const delay = ONE_MINUTE_IN_MS - (Date.now() % ONE_MINUTE_IN_MS);

  setTimeout(() => {
    setCurrentTime(new Date());

    setInterval(() => {
      setCurrentTime(new Date());
    }, ONE_MINUTE_IN_MS);
  }, delay);
})();
