import { Button } from '@mason/ui/button';
import { Icons } from '@mason/ui/icons';
import { DateNavigator } from './date-navigator';
import { OptionsDropdown } from './options-dropdown';
import { TodayButton } from './today-button';

export function CalendarHeader() {
  return (
    <div
      className="mx-2 flex items-center justify-between gap-4"
      style={{
        height: 'var(--calendar-header-height)',
      }}
    >
      <div className="flex gap-2">
        <DateNavigator />
        <TodayButton />
      </div>
      <div className="flex gap-2">
        <OptionsDropdown />
        <Button variant="ghost">
          <Icons.Plus />
          Add entry (NI)
        </Button>
      </div>
    </div>
  );
}
