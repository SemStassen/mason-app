import { useAtomRef } from '@effect-atom/atom-react';
import { Button } from '@mason/ui/button';
import { Icons } from '@mason/ui/icons';
import { cn } from '@mason/ui/utils';
import { ledgerAtom } from '~/atoms/ledger-atom';

function LedgerToggle() {
  const { isActive: ledgerIsActive } = useAtomRef(ledgerAtom);

  return (
    <Button
      className="w-full"
      onClick={() =>
        ledgerAtom.update(({ isActive, ...props }) => ({
          ...props,
          isActive: !isActive,
        }))
      }
      variant="secondary"
    >
      <Icons.Circle
        className={cn(ledgerIsActive ? 'text-green-500' : 'text-red-500')}
      />
      Toggle ledger
    </Button>
  );
}

export { LedgerToggle };
