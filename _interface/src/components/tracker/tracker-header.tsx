import { Badge } from "@mason/ui/badge";
import { Button } from "@mason/ui/button";
import { Calendar } from "@mason/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@mason/ui/dropdown";
import { Hotkey } from "@mason/ui/hotkey";
import { Icons } from "@mason/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@mason/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@mason/ui/tooltip";
import { observer } from "mobx-react-lite";
import { useHotkeys } from "react-hotkeys-hook";
import { Fragment } from "react/jsx-runtime";
import { HOTKEYS } from "~/lib/constants/hotkeys";
import { rootStore } from "~/stores/root-store";
import { RouteHeader } from "../route-header";

const GoToTodayButton = observer(() => {
  const hotkey = HOTKEYS.tracker.goToToday.key;
  const { trackerStore } = rootStore;

  useHotkeys(hotkey, () => trackerStore.goToToday());

  return (
    !trackerStore.isTodayInView && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => trackerStore.goToToday()}
          >
            Today
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Go to today <Hotkey>{hotkey}</Hotkey>
        </TooltipContent>
      </Tooltip>
    )
  );
});

const getNavigationText = (
  daysInView: number,
  direction: "previous" | "next",
) => {
  if (daysInView === 7) return `Go to ${direction} week`;
  if (daysInView === 1) return `Go to ${direction} day`;
  return `Go to ${direction} ${daysInView} days`;
};

const TrackerNavigation = observer(() => {
  const { trackerStore } = rootStore;

  useHotkeys(HOTKEYS.tracker.goToNextPeriod.key, () =>
    trackerStore.goToNextPeriod(),
  );
  useHotkeys(HOTKEYS.tracker.goToPreviousPeriod.key, () =>
    trackerStore.goToPreviousPeriod(),
  );

  return (
    <div className="flex flex-1 items-center gap-1.5">
      <Popover>
        <PopoverTrigger asChild>
          <span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="w-24 gap-1">
                  {trackerStore.dateInViewMonth.map((month, index) => (
                    <Fragment key={month}>
                      {index === 1 && (
                        <span className="text-contrast-75">/</span>
                      )}
                      <span key={month} className="text-contrast-60">
                        {month.toLocaleString()}
                      </span>
                    </Fragment>
                  ))}
                  <span className="text-contrast-60">
                    {trackerStore.dateInViewYear
                      .toString()
                      .slice(
                        trackerStore.dateInViewMonth.length === 1 ? 0 : -2,
                      )}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Change date</TooltipContent>
            </Tooltip>
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={trackerStore.dateInView}
            onSelect={(date: Date | undefined) => {
              if (date) {
                trackerStore.setDateInView(date);
              }
            }}
            weekStartsOn={trackerStore.weekStartsOn}
          />
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="contrast">W{trackerStore.dateInViewWeekNumber}</Badge>
        </TooltipTrigger>
        <TooltipContent>
          Week {trackerStore.dateInViewWeekNumber}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => trackerStore.goToPreviousPeriod()}
          >
            <Icons.ChevronLeft />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {getNavigationText(trackerStore.daysInView, "previous")}{" "}
          <Hotkey>←</Hotkey>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => trackerStore.goToNextPeriod()}
          >
            <Icons.ChevronRight />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {getNavigationText(trackerStore.daysInView, "next")}{" "}
          <Hotkey>→</Hotkey>
        </TooltipContent>
      </Tooltip>
      <GoToTodayButton />
    </div>
  );
});

const TrackerOptions = observer(() => {
  const { trackerStore } = rootStore;

  useHotkeys(HOTKEYS.tracker.setDayView.key, () =>
    trackerStore.setDaysInView(1),
  );
  useHotkeys(HOTKEYS.tracker.setWeekView.key, () =>
    trackerStore.setDaysInView(7),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <Icons.DotsThreeHorizontal />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end">Open options</TooltipContent>
          </Tooltip>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuCheckboxItem
          checked={trackerStore.daysInView === 1}
          onCheckedChange={() => trackerStore.setDaysInView(1)}
        >
          Day view <Hotkey>{HOTKEYS.tracker.setDayView.key}</Hotkey>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={trackerStore.daysInView === 7}
          onCheckedChange={() => trackerStore.setDaysInView(7)}
        >
          Week view <Hotkey>{HOTKEYS.tracker.setWeekView.key}</Hotkey>
        </DropdownMenuCheckboxItem>
        {/* <DropdownMenuSub>
            <DropdownMenuSubTrigger className="ps-8">
              Show number of days
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={trackerStore.daysInView === 2}
                  onCheckedChange={() => trackerStore.setDaysInView(2)}
                >
                  2 days
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={trackerStore.daysInView === 3}
                  onCheckedChange={() => trackerStore.setDaysInView(3)}
                >
                  3 days
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={trackerStore.daysInView === 4}
                  onCheckedChange={() => trackerStore.setDaysInView(4)}
                >
                  4 days
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={trackerStore.daysInView === 5}
                  onCheckedChange={() => trackerStore.setDaysInView(5)}
                >
                  5 days
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={trackerStore.daysInView === 6}
                  onCheckedChange={() => trackerStore.setDaysInView(6)}
                >
                  6 days
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

function TrackerHeader() {
  return (
    <RouteHeader>
      <div className="flex flex-1 items-center justify-end gap-2">
        {/* <Badge variant="outline">Personal</Badge> */}
        <TrackerNavigation />
        <TrackerOptions />
      </div>
    </RouteHeader>
  );
}

export { TrackerHeader };
