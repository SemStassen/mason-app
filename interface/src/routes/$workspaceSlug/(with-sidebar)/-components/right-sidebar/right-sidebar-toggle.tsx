import { Button } from '@mason/ui/button';
import { Icons } from '@mason/ui/icons';
import { toggleRightSidebar } from '~/atoms/ui-atoms';

function RightSidebarToggle() {
  return (
    <Button onClick={toggleRightSidebar} size="icon" variant="ghost">
      <Icons.Sidebar />
    </Button>
  );
}

export { RightSidebarToggle };
