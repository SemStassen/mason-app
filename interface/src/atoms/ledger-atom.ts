import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { LedgerService } from "~/core/services/ledger";

const runtimeAtom = Atom.runtime(LedgerService.Default);

export const toggleLedgerAtom = runtimeAtom.fn(
  Effect.fnUntraced(function* () {
    const ledger = yield* LedgerService;
    return yield* ledger.toggleIsActive;
  })
);

export const ledgerIsActiveAtom = runtimeAtom.subscriptionRef(
  Effect.gen(function* () {
    const ledger = yield* LedgerService;
    return ledger.isActiveRef;
  })
);
