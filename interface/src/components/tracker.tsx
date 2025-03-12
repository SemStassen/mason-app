import { Button } from "@mason/ui/button";
import { Icons } from "@mason/ui/icons";
import { uiStore } from "~/stores/ui-store";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@mason/ui/dropdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "@mason/ui/tooltip";
import { cn } from "@mason/ui/utils";
import { addDays, format, isSameDay } from "date-fns";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { formatters, getDayProgressPercentage } from "~/lib/utils/dates";

const TrackerHeader = observer(() => {
  const trackerStore = uiStore.tracker;

  return (
    <header className="px-3 h-11 shrink-0 flex items-center border-b justify-between">
      <div
        className="flex gap-1.5 items-center flex-1 transition-[margin]"
        style={{
          marginLeft: uiStore.isSidebarOpen ? 0 : 48,
          marginRight: uiStore.isSidebarOpen ? 48 : 0,
        }}
      >
        <div className="flex gap-1 text-sm">
          <span>Aug</span>
          <span className="text-contrast-75">/</span>
          <span>Sep</span>
          <span className="text-contrast-60">
            {uiStore.tracker.dateInView.getFullYear()}
          </span>
        </div>
        <div className="bg-muted text-contrast-60 py-1 px-1.5 rounded-md text-xs">
          W22
        </div>
        <Button
          variant="ghost"
          size="icon"
          //     onClick={() => updateDateInViewByDays(-1 * daysInView)}
        >
          <Icons.ChevronLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          //     onClick={() => updateDateInViewByDays(1 * daysInView)}
        >
          <Icons.ChevronRight />
        </Button>
        {/* TODO: Add an animation to this */}
        {/* {!isSameDay(dateInView, currentDate) && (
      <Button
        variant="ghost"
        size="icon"
        className="w-auto"
        onClick={() => setDateInView(currentDate)}
      >
        Today
      </Button>
    )} */}
      </div>
      <div className="flex items-center gap-2 flex-1 justify-end">
        {/* <Badge variant="outline">Personal</Badge> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <Icons.DotsThreeHorizontal />
                  </Button>
                </TooltipTrigger>
                <TooltipContent collisionPadding={{ right: 8 }}>
                  Open options
                </TooltipContent>
              </Tooltip>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent collisionPadding={{ right: 12 }}>
            <DropdownMenuCheckboxItem
              checked={trackerStore.daysInView === 1}
              onCheckedChange={() => trackerStore.setDaysInView(1)}
            >
              Day view
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={trackerStore.daysInView === 7}
              onCheckedChange={() => trackerStore.setDaysInView(7)}
            >
              Week view
            </DropdownMenuCheckboxItem>
            <DropdownMenuSub>
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
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});

const SCROLL_SNAP_BUFFER = 30;
const VISIBLE_DAYS_BUFFER_MULTIPLIER = 4;

const TrackerCalendar = observer(() => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const trackerStore = uiStore.tracker;

  const daysInViewOffset =
    (trackerStore.daysInView * VISIBLE_DAYS_BUFFER_MULTIPLIER) / 2 -
    trackerStore.daysInView;
  const dayWidth = 100 / SCROLL_SNAP_BUFFER / trackerStore.daysInView;
  const dayOffsetToStartOfWeek = 0;

  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollWidth = scrollContainerRef.current.scrollWidth;
      scrollContainerRef.current.scrollLeft = scrollWidth * 0.5;
    }
  }, [trackerStore.daysInView]);

  return (
    <div
      ref={scrollContainerRef}
      className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-x-hidden snap-x snap-mandatory h-full scroll-ps-16"
    >
      <div
        className="relative isolate"
        style={{
          width: `calc(${SCROLL_SNAP_BUFFER} * (100% - 62px))`,
        }}
      >
        {/**
         * DAY SCROLL SNAPPING
         */}
        <div className="absolute inset-0 grid auto-cols-fr grid-flow-col ml-16 [&_>_*]:snap-start">
          {Array.from({
            length: SCROLL_SNAP_BUFFER * trackerStore.daysInView,
          }).map((_, index) => {
            // biome-ignore lint/suspicious/noArrayIndexKey: not dynamic
            return <div key={index} />;
          })}
        </div>
        {/**
         * TOPBAR
         */}
        <div className="sticky top-0 inset-0 z-20">
          {/**
           * TIMEZONE
           */}
          <div className="sticky left-0 size-0 z-30">
            <div className="h-10 w-16 bg-background flex items-center px-2 gap-2 border-r border-muted">
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
          <div className="relative overflow-hidden bg-background h-[40px] ml-16 border-b border-muted">
            {Array.from({
              length: VISIBLE_DAYS_BUFFER_MULTIPLIER * trackerStore.daysInView,
            }).map((_, index) => {
              const currentDay = addDays(
                uiStore.tracker.dateInView,
                index - daysInViewOffset,
              );
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: count won't change
                  key={index}
                  className="absolute top-0 h-full flex items-center justify-center"
                  style={{
                    width: `${dayWidth}%`,
                    left: `${
                      50 + // Starts from center of container (50%)
                      (index - dayOffsetToStartOfWeek) * // Adjusts for day position relative to start of week
                        dayWidth - // Multiplies by width of each day cell
                      dayWidth * daysInViewOffset // Shifts everything left by half the total view width
                    }%`,
                  }}
                >
                  {format(currentDay, "EEE")}
                  <span
                    className={cn(
                      "ml-1",
                      isSameDay(currentDay, trackerStore.currentDate) &&
                        "flex items-center justify-center bg-primary text-white h-7 w-7 rounded-md",
                    )}
                  >
                    {format(currentDay, "dd")}
                  </span>
                </div>
              );
            })}
          </div>
          {/**
           * ALL DAY
           */}
          <div className="h-6">
            <div className="sticky left-0 size-0">
              <div className="w-screen border-y border-muted h-6 bg-background" />
            </div>
            <div className="sticky left-0 z-20 size-0">
              <div className="text-xs flex w-16 h-6 justify-end border-y border-r border-muted bg-background px-2">
                <div className="flex items-center">all-day</div>
              </div>
            </div>
            {/**
             * This will probably require different positioning then normal events
             */}
            <div className="relative overflow-hidden ml-16">
              {Array.from({
                length:
                  VISIBLE_DAYS_BUFFER_MULTIPLIER * trackerStore.daysInView,
              }).map((_, index) => {
                return (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: count won't change
                    key={index}
                    className="absolute top-0 h-full flex items-center justify-center"
                    style={{
                      width: `${dayWidth}%`,
                      left: `${
                        50 + // Starts from center of container (50%)
                        (index - dayOffsetToStartOfWeek) * // Adjusts for day position relative to start of week
                          dayWidth - // Multiplies by width of each day cell
                        dayWidth * daysInViewOffset // Shifts everything left by half the total view width
                      }%`,
                    }}
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
          <div className="relative h-[2000px]">
            <div
              className="absolute h-px w-screen bg-red-400/60 transition-[top,opacity]"
              style={{
                top: `${getDayProgressPercentage(trackerStore.currentDate) - 0.05}%`,
              }}
            />
          </div>
        </div>
        {/* HOURLY OVERVIEW */}
        <div className="sticky left-0 size-0 z-10">
          <div className="relative h-[2000px] w-16 flex flex-col border-r border-muted bg-background">
            {Array.from({ length: 24 }).map((_, index) => {
              if (index === 0) {
                return;
              }

              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: not dynamic
                  key={index}
                  className="absolute inset-x-0 -translate-y-1/2"
                  style={{
                    top: `calc(calc(100% / 24) * ${index})`,
                  }}
                >
                  <div className="grow text-xs text-muted-foreground text-center">
                    {formatters.time(new Date(0, 0, 0, index))}
                  </div>
                </div>
              );
            })}
            {/* <div
              className="absolute inset-x-0 -translate-y-1/2"
              style={{
                top: `${calculateDayProgressPercentage(new Date(currentTime))}%`,
              }}
            >
              <div className="grow text-xs text-destructive text-center">
                {formatters.time(currentTime, uses24HourClock ? "24h" : "12h")}
              </div>
            </div> */}
          </div>
        </div>

        <div
          className="relative overflow-hidden h-[2000px] ml-16"
          style={{
            backgroundSize: "100% calc(100% / 24)",
            backgroundImage:
              "linear-gradient(to bottom, var(--color-popover) 1px, transparent 1px), repeating-linear-gradient(transparent, transparent calc(calc(100% / 4) - 2px), var(--color-popover) calc(100% / 4))",
          }}
        >
          {/* {Array.from({ length: 7 * uiStore.tracker.daysInView }).map(
            (_, index) => {
              const currentDayStart = startOfDay(
                addDays(dateInView, index - daysInViewOffset),
              );
              const currentDayEnd = endOfDay(
                addDays(dateInView, index - daysInViewOffset),
              );
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: count won't change
                  key={index}
                  className="absolute top-0 isolate h-full"
                  style={{
                    width: `${dayWidth}%`,
                    left: `${50 - dayWidth * daysInViewOffset + (index - dayOffsetToStartOfWeek) * dayWidth}%`,
                  }}
                >
                  <div className="relative h-full before:absolute before:h-full before:bg-muted before:w-px"> */}
          {/* {convertedTimeEntries.map(
                  ({ uuid, project, startedAt, stoppedAt, note }) => {
                    if (
                      (startedAt >= currentDayStart &&
                        startedAt <= currentDayEnd) ||
                      (stoppedAt >= currentDayStart &&
                        stoppedAt <= currentDayEnd) ||
                      (startedAt <= currentDayStart &&
                        stoppedAt >= currentDayEnd)
                    ) {
                      const entryStart =
                        startedAt < currentDayStart
                          ? currentDayStart
                          : startedAt;
                      const entryEnd =
                        stoppedAt > currentDayEnd ? currentDayEnd : stoppedAt;

                      return (
                        <TimeEntry
                          key={uuid}
                          projectName={project?.name}
                          projectHexColor={project?.hexColor}
                          uuid={uuid}
                          startedAt={startedAt}
                          stoppedAt={stoppedAt}
                          note={note}
                          style={{
                            top: `${((entryStart.getHours() + entryStart.getMinutes() / 60) * 100) / 24}%`,
                            height: `${Math.max(((entryEnd.getTime() - entryStart.getTime()) / (1000 * 60 * 60)) * (100 / 24), 1.04)}%`,
                          }}
                        />
                      );
                    }
                    return null;
                  },
                )} */}
          {/* </div>
                </div>
              );
            },
          )} */}
        </div>
      </div>
    </div>
  );
});

function Tracker() {
  return (
    <div className="flex flex-col w-full">
      <TrackerHeader />
      <div className="w-full h-full flex overflow-auto">
        <div className="w-full h-full">
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
