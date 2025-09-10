import { differenceInMinutes, startOfDay } from 'date-fns';
import { FIRST_VISIBLE_HOUR, LAST_VISIBLE_HOUR } from '.';
import type { ITimeEntry } from './types';

/**
 * Groups overlapping time entries into separate columns for calendar display.
 *
 * This function solves the visual problem of displaying multiple time entries that
 * overlap in time by organizing them into non-overlapping groups (columns). Each
 * group contains time entries that don't overlap with each other, allowing them
 * to be displayed side-by-side in a calendar view.
 *
 * @param timeEntries - Array of time entries to group
 * @returns Array of groups, where each group is an array of non-overlapping time entries
 *
 * @example
 * ```typescript
 * const entries = [
 *   { startedAt: new Date('09:00'), stoppedAt: new Date('10:00') }, // A
 *   { startedAt: new Date('09:30'), stoppedAt: new Date('11:00') }, // B (overlaps A)
 *   { startedAt: new Date('10:30'), stoppedAt: new Date('12:00') }  // C (overlaps B)
 * ];
 *
 * const groups = groupTimeEntries(entries);
 * // Result: [[A], [B], [C]] - each in separate column due to overlaps
 * ```
 */
export function groupTimeEntries(timeEntries: Array<ITimeEntry>) {
  const sortedTimeEntries = timeEntries.sort(
    (a, b) => a.startedAt.getTime() - b.startedAt.getTime()
  );
  const groups: Array<Array<ITimeEntry>> = [];

  for (const timeEntry of sortedTimeEntries) {
    let placed = false;
    for (const group of groups) {
      const lastTimeEntryInGroup = group.at(-1);

      if (
        lastTimeEntryInGroup &&
        timeEntry.startedAt >= lastTimeEntryInGroup.stoppedAt
      ) {
        group.push(timeEntry);
        placed = true;
        break;
      }
    }

    if (!placed) {
      groups.push([timeEntry]);
    }
  }

  return groups;
}

/**
 * Calculates the CSS positioning and sizing for a time entry block in a calendar grid.
 *
 * This function determines where and how large a time entry should appear on the calendar
 * by calculating its position relative to the visible time range and its width based on
 * how many overlapping entries are in the same group.
 *
 * @param timeEntry - The time entry to calculate styles for
 * @param day - The day this time entry appears on (used to calculate relative positioning)
 * @param groupIndex - The index of this time entry's group (determines horizontal position)
 * @param groupSize - Total number of groups for this time slot (determines width)
 * @returns CSS style object with top, width, and left properties as percentages
 *
 * @example
 * ```typescript
 * const timeEntry = {
 *   startedAt: new Date('2024-01-01 10:30'),
 *   stoppedAt: new Date('2024-01-01 12:00')
 * };
 * const day = new Date('2024-01-01');
 *
 * const style = getTimeEntryBlockStyle(timeEntry, day, 0, 2);
 * // Result: { top: "43.75%", width: "50%", left: "0%" }
 * // - top: 43.75% (10:30 AM position in 24-hour grid)
 * // - width: 50% (half width because 2 groups total)
 * // - left: 0% (first group, so leftmost position)
 * ```
 */
export function getTimeEntryBlockStyle(
  timeEntry: ITimeEntry,
  day: Date,
  groupIndex: number,
  groupSize: number
) {
  const dayStart = startOfDay(day);
  const timeEntryStart =
    timeEntry.startedAt < dayStart ? dayStart : timeEntry.startedAt;
  const startMinutes = differenceInMinutes(timeEntryStart, dayStart);

  const visibleStartMinutes = FIRST_VISIBLE_HOUR * 60;
  const visibleEndMinutes = LAST_VISIBLE_HOUR * 60;
  const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes;
  const top =
    ((startMinutes - visibleStartMinutes) / visibleRangeMinutes) * 100;

  const width = 100 / groupSize;
  const left = groupIndex * width;

  return { top: `${top}%`, width: `${width}%`, left: `${left}%` };
}
