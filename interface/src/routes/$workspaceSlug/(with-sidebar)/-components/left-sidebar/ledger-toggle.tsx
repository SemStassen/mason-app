import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import { ledgerIsActiveAtom, toggleLedgerAtom } from "~/atoms/ledger-atom";

function LedgerToggle() {
  const ledgerIsActive = useAtomValue(ledgerIsActiveAtom.subscriptionRef);
  const toggleLedger = useAtomSet(toggleLedgerAtom.fn);

  return Result.builder(ledgerIsActive)
    .onSuccess((isActive: boolean) => (
      <Button
        className="w-full justify-start"
        onClick={() => toggleLedger()}
        variant="ghost"
      >
        {isActive ? <Icons.EyeOpen /> : <Icons.EyeClosed />}
        {isActive ? "Disable tracking" : "activate tracking"}
      </Button>
    ))
    .render();
}

export { LedgerToggle };
