import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { cn } from "@mason/ui/utils";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { observer } from "mobx-react-lite";
import { Route } from "~/app/routes/(app)/tracker";
import { useLiveQuery } from "~/hooks/use-live-query";
import { formatters } from "~/lib/utils/dates";
import { rootStore } from "~/stores/root-store";

function TimeEntry({
  uuid,
  started_at,
  stopped_at,
  hex_color,
  ...props
}: React.ComponentProps<"div"> & {
  uuid: string;
  started_at: Date;
  stopped_at: Date;
  hex_color: string;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: uuid,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn("absolute")}
      {...listeners}
      {...attributes}
      {...props}
    >
      <button
        className="flex h-full w-full overflow-hidden rounded-md text-start "
        style={{
          backgroundColor: `${hex_color}B3`,
        }}
        type="button"
      >
        <div
          className="h-full w-1 flex-none"
          style={{
            backgroundColor: hex_color,
          }}
        />
        <div className="p-2">
          <div className="flex flex-col text-sm text-white">
            <div className="font-semibold">Event name</div>
            <div className="-space-y-1 flex flex-col">
              <div>{formatters.duration(started_at, stopped_at)}</div>
              <div>
                {formatters.time(started_at)} - {formatters.time(stopped_at)}
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

const DayColumn = observer(({ index }: { index: number }) => {
  const { liveTimeEntries } = Route.useLoaderData();
  const timeEntries = useLiveQuery(liveTimeEntries);

  const { trackerStore } = rootStore;

  const currentDayStart = startOfDay(addDays(trackerStore.dateInView, index));
  const currentDayEnd = endOfDay(addDays(trackerStore.dateInView, index));

  const { setNodeRef } = useDroppable({
    id: currentDayStart.toISOString(),
  });

  return (
    <div
      key={index}
      ref={setNodeRef}
      className="absolute top-0 h-full"
      style={{
        width: `${100 / trackerStore.daysInView}%`,
        left: `${(100 / trackerStore.daysInView) * index}%`,
      }}
    >
      <div className="relative h-full before:absolute before:h-full before:w-px before:bg-popover">
        {/* 
         Cells for each quarter hour of the day.
         */}
        {Array.from({ length: 24 * 4 }).map((_, index) => {
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: We need to use the index as the key here.
              key={index}
              className={cn(
                "h-[calc(100%_/_96)] border-popover/50 border-b",
                index % 4 === 3 && "border-border",
              )}
            />
          );
        })}
        {timeEntries?.rows.map(
          ({ uuid, started_at, stopped_at: _stopped_at, activity }) => {
            // Use currentDate as fallback for _stopped_at if it is null,
            // indicating an ongoing time entry.
            const stopped_at = _stopped_at || trackerStore.currentDate;

            if (
              (started_at >= currentDayStart && started_at <= currentDayEnd) ||
              (stopped_at >= currentDayStart && stopped_at <= currentDayEnd) ||
              (started_at <= currentDayStart && stopped_at >= currentDayEnd)
            ) {
              const entryStart =
                started_at < currentDayStart ? currentDayStart : started_at;
              const entryEnd =
                stopped_at > currentDayEnd ? currentDayEnd : stopped_at;

              return (
                <TimeEntry
                  key={uuid}
                  style={{
                    top: `${((entryStart.getHours() + entryStart.getMinutes() / 60) * 100) / 24}%`,
                    left: 2,
                    width: "calc(100% - 12px)",
                    height: `${Math.max(((entryEnd.getTime() - entryStart.getTime()) / (1000 * 60 * 60)) * (100 / 24), 1.04)}%`,
                  }}
                  uuid={uuid}
                  started_at={started_at}
                  stopped_at={stopped_at}
                  hex_color={activity.project.hex_color}
                />
              );
            }
            return null;
          },
        )}
      </div>
    </div>
  );
});

const TrackerTimeGrid = observer(() => {
  const { trackerStore } = rootStore;

  return (
    <DndContext>
      <div className="relative ml-16 h-[300vh] overflow-hidden">
        {Array.from({ length: trackerStore.daysInView }).map((_, index) => {
          // biome-ignore lint/suspicious/noArrayIndexKey: We need to use the index as the key here.
          return <DayColumn key={index} index={index} />;
        })}
      </div>
    </DndContext>
  );
});

export { TrackerTimeGrid };
