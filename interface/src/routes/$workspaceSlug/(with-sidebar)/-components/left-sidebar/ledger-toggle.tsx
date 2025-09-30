import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import { ledgerIsActiveAtom, toggleLedgerAtom } from "~/atoms/ledger-atom";
import { PLATFORM } from "~/utils/constants";

function LedgerToggle() {
  const ledgerIsActive = useAtomValue(ledgerIsActiveAtom);
  const toggleLedger = useAtomSet(toggleLedgerAtom);

  if (PLATFORM.platform !== "desktop") {
    return null;
  }

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
