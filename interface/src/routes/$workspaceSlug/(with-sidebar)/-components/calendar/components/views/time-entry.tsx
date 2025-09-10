import { differenceInMinutes } from "date-fns";
import { formatter } from "~/utils/date-time";
import { CALENDAR_HOUR_HEIGHT_VAR } from "../..";
import type { ITimeEntry } from "../../types";
import { DraggableTimeEntry } from "../dnd/draggable-time-entry";

function TimeEntry({ timeEntry }: { timeEntry: ITimeEntry }) {
  const { project, startedAt, stoppedAt, id } = timeEntry;

  const durationInMinutes = differenceInMinutes(stoppedAt, startedAt);

  return (
    <DraggableTimeEntry id={id}>
      <div
        className="overflow-hidden rounded-md bg-primary p-1"
        style={{
          backgroundColor: project.hexColor,
          height: `calc(${durationInMinutes / 60} * var(${CALENDAR_HOUR_HEIGHT_VAR}))`,
        }}
      >
        <div className="text-sm">{project.name}</div>
        <div className="whitespace-nowrap text-xs">
          <span>{formatter.time(timeEntry.startedAt)}</span> -{" "}
          <span>{formatter.time(timeEntry.stoppedAt)}</span>
        </div>
      </div>
    </DraggableTimeEntry>
  );
}

export { TimeEntry };
