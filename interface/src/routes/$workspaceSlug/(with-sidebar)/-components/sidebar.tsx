import { useAtomSet } from '@effect-atom/atom-react';
import { Button } from '@mason/ui/button';
import { Icons } from '@mason/ui/icons';
import { Link } from '@tanstack/react-router';
import { debugSheetAtom } from '~/atoms/ui-atoms';
import { Route } from '..';

function Sidebar() {
  const { workspace } = Route.useRouteContext();
  // const debugSheet = useAtomValue(debugSheetAtom)
  const setDebugSheet = useAtomSet(debugSheetAtom);

  return (
    <aside className="flex w-[240px] flex-col justify-between border-r p-4">
      <div>{workspace.name}</div>
      <div className="space-y-2">
        <Button
          className="w-full"
          render={(props) => (
            <Link
              from="/$workspaceSlug"
              to="/$workspaceSlug/settings"
              {...props}
            >
              <Icons.Settings /> Settings
            </Link>
          )}
          variant="ghost"
        />
        <Button
          className="w-full"
          onClick={() => setDebugSheet(({ isOpen }) => ({ isOpen: !isOpen }))}
          variant="secondary"
        >
          Inspector
        </Button>
      </div>
    </aside>
  );
}

export { Sidebar };
