import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { LedgerService } from "~/core/services/ledger";
import { appLayer } from "..";

let _ledgerRuntimeAtom: Atom.AtomRuntime<LedgerService> | null = null;

function getLedgerRuntimeAtom() {
  if (!_ledgerRuntimeAtom) {
    _ledgerRuntimeAtom = Atom.runtime(appLayer);
  }
  return _ledgerRuntimeAtom;
}

export const toggleLedgerAtom = {
  get fn() {
    return getLedgerRuntimeAtom().fn(
      Effect.fnUntraced(function* () {
        const ledger = yield* LedgerService;
        return yield* ledger.toggleIsActive;
      })
    );
  },
};

export const ledgerIsActiveAtom = {
  get subscriptionRef() {
    return getLedgerRuntimeAtom().subscriptionRef(
      Effect.gen(function* () {
        const ledger = yield* LedgerService;
        return ledger.isActiveRef;
      })
    );
  },
};
