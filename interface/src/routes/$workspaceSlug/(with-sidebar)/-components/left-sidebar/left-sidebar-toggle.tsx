import { Button } from '@mason/ui/button';
import { Icons } from '@mason/ui/icons';
import { toggleLeftSidebar } from '~/atoms/ui-atoms';

function LeftSidebarToggle() {
  return (
    <Button onClick={toggleLeftSidebar} size="icon" variant="ghost">
      <Icons.Sidebar />
    </Button>
  );
}

export { LeftSidebarToggle };
