import {} from "@mason/ui/dropdown";
import {} from "@mason/ui/popover";
import {} from "@mason/ui/tooltip";
import { cn } from "@mason/ui/utils";
import { addDays, format, isSameDay } from "date-fns";
import { observer } from "mobx-react-lite";
import { formatters, getDayProgressPercentage } from "~/lib/utils/dates";
import { rootStore } from "~/stores/root-store";
import { TrackerHeader } from "./tracker-header";
import { TrackerTimeGrid } from "./tracker-time-grid";

const TrackerCalendar = observer(() => {
  const { trackerStore } = rootStore;

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
        <TrackerTimeGrid />
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
