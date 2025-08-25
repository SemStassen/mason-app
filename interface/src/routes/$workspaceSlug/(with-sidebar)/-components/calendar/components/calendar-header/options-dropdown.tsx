import { useAtomSet, useAtomValue } from '@effect-atom/atom-react';
import { Button } from '@mason/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@mason/ui/dropdown-menu';
import { Icons } from '@mason/ui/icons';
import { calendarAtom } from '~/atoms/calendar-atoms';

function OptionsDropdown() {
  const { daysInView } = useAtomValue(calendarAtom);
  const setCalendar = useAtomSet(calendarAtom);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(props) => (
          <Button size="icon" variant="ghost" {...props}>
            <Icons.DotsThreeHorizontal />
          </Button>
        )}
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={daysInView === 1}
            onCheckedChange={() =>
              setCalendar((value) => ({ ...value, daysInView: 1 }))
            }
          >
            Day view
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={daysInView === 7}
            onCheckedChange={() =>
              setCalendar((value) => ({ ...value, daysInView: 7 }))
            }
          >
            Week view
          </DropdownMenuCheckboxItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Show number of days</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuCheckboxItem
                checked={daysInView === 2}
                onCheckedChange={() =>
                  setCalendar((value) => ({ ...value, daysInView: 2 }))
                }
              >
                2 Days
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={daysInView === 3}
                onCheckedChange={() =>
                  setCalendar((value) => ({ ...value, daysInView: 3 }))
                }
              >
                3 Days
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={daysInView === 4}
                onCheckedChange={() =>
                  setCalendar((value) => ({ ...value, daysInView: 4 }))
                }
              >
                4 Days
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={daysInView === 5}
                onCheckedChange={() =>
                  setCalendar((value) => ({ ...value, daysInView: 5 }))
                }
              >
                5 Days
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={daysInView === 6}
                onCheckedChange={() =>
                  setCalendar((value) => ({ ...value, daysInView: 6 }))
                }
              >
                6 Days
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { OptionsDropdown };
