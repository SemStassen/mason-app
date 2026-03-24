import { useAtomRef } from "@effect-atom/atom-react";
import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@mason/ui/menu";
import {
  calendarDaysInViewAtom,
  setCalendarDaysInView,
} from "~/atoms/calendar-atom";

function OptionsDropdown() {
  const daysInView = useAtomRef(calendarDaysInViewAtom);
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
            onCheckedChange={() => setCalendarDaysInView(1)}
          >
            Day view
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={daysInView === 7}
            onCheckedChange={() => setCalendarDaysInView(7)}
          >
            Week view
          </DropdownMenuCheckboxItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Show number of days</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuCheckboxItem
                checked={daysInView === 2}
                onCheckedChange={() => setCalendarDaysInView(2)}
              >
                2 Days
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={daysInView === 3}
                onCheckedChange={() => setCalendarDaysInView(3)}
              >
                3 Days
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={daysInView === 4}
                onCheckedChange={() => setCalendarDaysInView(4)}
              >
                4 Days
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={daysInView === 5}
                onCheckedChange={() => setCalendarDaysInView(5)}
              >
                5 Days
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={daysInView === 6}
                onCheckedChange={() => setCalendarDaysInView(6)}
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
