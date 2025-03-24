import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";

import { Badge } from "@mason/ui/badge";
import { Calendar } from "@mason/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@mason/ui/dropdown";
import { Hotkey } from "@mason/ui/hotkey";
import { Popover, PopoverContent, PopoverTrigger } from "@mason/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@mason/ui/tooltip";
import { cn } from "@mason/ui/utils";
import { addDays, endOfDay, format, isSameDay, startOfDay } from "date-fns";
import { observer } from "mobx-react-lite";
import { useHotkeys } from "react-hotkeys-hook";
import { Fragment } from "react/jsx-runtime";
import { RouteHeader } from "~/app/route-header";
import { Route } from "~/app/routes/tracker.index";
import { useLiveQuery } from "~/hooks/use-live-query";
import { HOTKEYS } from "~/lib/constants/hotkeys";
import { formatters, getDayProgressPercentage } from "~/lib/utils/dates";
import { rootStore } from "~/stores/root-store";

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

const TrackerCalendar = observer(() => {
  const { trackerStore } = rootStore;

  const { liveTimeEntries } = Route.useLoaderData();

  const timeEntries = useLiveQuery(liveTimeEntries);

  return (
    <div className="h-full overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="relative isolate">
        {/**
         * TOPBAR
         */}
        <div className="sticky inset-0 top-0 z-20">
          {/**
           * TIMEZONE
           */}
          <div className="sticky left-0 z-30 size-0">
            <div className="flex h-10 w-16 items-center gap-2 border-muted border-r bg-background px-2">
              <div className="text-xs">
                {new Date()
                  .toLocaleDateString(undefined, {
                    day: "2-digit",
                    timeZoneName: "short",
                  })
                  .substring(4)}
              </div>
            </div>
          </div>
          {/**
           * DAYS
           */}
          <div className="ml-16 flex h-[40px] bg-background">
            {Array.from({
              length: trackerStore.daysInView,
            }).map((_, index) => {
              const currentDay = addDays(trackerStore.dateInView, index);
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: count won't change
                  key={index}
                  className="flex flex-1 items-center justify-center"
                >
                  {format(currentDay, "EEE")}
                  <span
                    className={cn(
                      "ml-1",
                      isSameDay(currentDay, trackerStore.currentDate) &&
                        "flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white",
                    )}
                  >
                    {format(currentDay, "dd")}
                  </span>
                </div>
              );
            })}
          </div>
          {/**
           * ALL DAY EVENTS (TOP)
           */}
          <div className="h-6">
            <div className="sticky left-0 size-0">
              <div className="h-6 w-screen border-muted border-y bg-background" />
            </div>
            <div className="sticky left-0 z-20 size-0">
              <div className="flex h-6 w-16 justify-end border-muted border-y border-r bg-background px-2 text-xs">
                <div className="flex items-center">all-day</div>
              </div>
            </div>
            {/**
             * This will probably require different positioning then normal events
             */}
            <div className="ml-16 flex">
              {Array.from({
                length: trackerStore.daysInView,
              }).map((_, index) => {
                return (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: count won't change
                    key={index}
                    className="flex flex-1 items-center justify-center"
                  />
                );
              })}
            </div>
          </div>
        </div>
        {/**
         * CURRENT TIME MARKER (LINE)
         */}
        <div className="pointer-events-none sticky left-0 z-10 size-0">
          <div className="relative h-[300vh]">
            <div
              className="absolute h-px w-screen bg-red-400/60 transition-[top,opacity]"
              style={{
                top: `${getDayProgressPercentage(trackerStore.currentDate) - 0.05}%`,
              }}
            />
          </div>
        </div>
        {/* HOURS (ON THE LEFT) */}
        <div className="sticky left-0 z-10 size-0">
          <div className="relative flex h-[300vh] w-16 flex-col border-muted border-r bg-background">
            {Array.from({ length: 24 }).map((_, index) => {
              if (index === 0) {
                return;
              }

              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: not dynamic
                  key={index}
                  className="-translate-y-1/2 absolute inset-x-0"
                  style={{
                    top: `calc(calc(100% / 24) * ${index})`,
                  }}
                >
                  <div className="grow text-center text-muted-foreground text-xs">
                    {formatters.time(new Date(0, 0, 0, index))}
                  </div>
                </div>
              );
            })}
            {/**
             * CURRENT TIME STAMP
             */}
            <div
              className="-translate-y-1/2 absolute inset-x-0"
              style={{
                top: `${getDayProgressPercentage(trackerStore.currentDate)}%`,
              }}
            >
              <div className="grow text-center text-red-400 text-xs">
                {formatters.time(trackerStore.currentDate)}
              </div>
            </div>
          </div>
        </div>

        {/**
         * TIME ENTRIES
         */}
        <div
          className="relative ml-16 h-[300vh] overflow-hidden"
          style={{
            backgroundSize: "100% calc(100% / 24)",
            backgroundImage:
              "linear-gradient(to bottom, var(--color-popover) 1px, transparent 1px), repeating-linear-gradient(transparent, transparent calc(calc(100% / 4) - 2px), var(--color-popover) calc(100% / 4))",
          }}
        >
          {Array.from({ length: trackerStore.daysInView }).map((_, index) => {
            const currentDayStart = startOfDay(
              addDays(trackerStore.dateInView, index),
            );
            const currentDayEnd = endOfDay(
              addDays(trackerStore.dateInView, index),
            );
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: count won't change
                key={index}
                className="absolute top-0 h-full"
                style={{
                  width: `${100 / trackerStore.daysInView}%`,
                  left: `${(100 / trackerStore.daysInView) * index}%`,
                }}
              >
                <div className="relative h-full before:absolute before:h-full before:w-px before:bg-popover">
                  {timeEntries?.rows.map(
                    ({ uuid, started_at, stopped_at: _stopped_at }) => {
                      const stopped_at =
                        _stopped_at || trackerStore.currentDate;

                      if (
                        (started_at >= currentDayStart &&
                          started_at <= currentDayEnd) ||
                        (stopped_at >= currentDayStart &&
                          stopped_at <= currentDayEnd) ||
                        (started_at <= currentDayStart &&
                          stopped_at >= currentDayEnd)
                      ) {
                        const entryStart =
                          started_at < currentDayStart
                            ? currentDayStart
                            : started_at;
                        const entryEnd =
                          stopped_at > currentDayEnd
                            ? currentDayEnd
                            : stopped_at;

                        return (
                          <div
                            key={uuid}
                            className={cn("absolute")}
                            style={{
                              top: `${((entryStart.getHours() + entryStart.getMinutes() / 60) * 100) / 24}%`,
                              left: 2,
                              width: "calc(100% - 12px)",
                              height: `${Math.max(((entryEnd.getTime() - entryStart.getTime()) / (1000 * 60 * 60)) * (100 / 24), 1.04)}%`,
                            }}
                          >
                            <button
                              className="flex h-full w-full overflow-hidden rounded-md bg-purple-800 text-start "
                              type="button"
                            >
                              <div className="h-full w-1 flex-none bg-purple-600" />
                              <div className="p-2">
                                <div className="flex flex-col text-sm text-white">
                                  <div className="font-semibold">
                                    Event name
                                  </div>
                                  <div className="-space-y-1 flex flex-col">
                                    <div>
                                      {formatters.duration(
                                        entryStart,
                                        entryEnd,
                                      )}
                                    </div>
                                    <div>
                                      {formatters.time(entryStart)} -{" "}
                                      {formatters.time(entryEnd)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </button>
                          </div>
                        );
                      }
                      return null;
                    },
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

function Tracker() {
  return (
    <div className="flex w-full flex-col">
      <TrackerHeader />
      <div className="flex h-full w-full overflow-auto">
        <div className="h-full w-full">
          <TrackerCalendar />
        </div>
        {/* <AnimatePresence>
          {selectedTimeEntryUuid && selectedTimeEntry && (
            <motion.div
              initial={{ width: 0 }}
              transition={{
                ease: "linear",
                duration: 0.15,
              }}
              animate={{ width: 360 }}
              exit={{ width: 0 }}
            >
              <div className="w-[360px] p-3 h-full border-l border-muted"></div>
            </motion.div>
          )}
        </AnimatePresence> */}
      </div>
    </div>
  );
}

export { Tracker };
