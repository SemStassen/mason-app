import {
  addDays,
  addHours,
  addMinutes,
  endOfWeek,
  startOfWeek,
} from 'date-fns';
import type { ITimeEntry } from './types';

// Generate dummy time entries from previous week to next week
const generateDummyTimeEntries = (): ITimeEntry[] => {
  const now = new Date();
  const previousWeekStart = startOfWeek(addDays(now, -7));
  const nextWeekEnd = endOfWeek(addDays(now, 7));

  const entries: ITimeEntry[] = [];
  const projects = [
    { name: 'Project Alpha', hexColor: '#3b82f6' },
    { name: 'Project Beta', hexColor: '#f59e42' },
    { name: 'Project Gamma', hexColor: '#10b981' },
    { name: 'Meeting', hexColor: '#f43f5e' },
    { name: 'Research', hexColor: '#a78bfa' },
  ];

  // Generate 3-5 entries per day for 3 weeks
  for (
    let day = new Date(previousWeekStart);
    day <= nextWeekEnd;
    day = addDays(day, 1)
  ) {
    const entriesPerDay = Math.floor(Math.random() * 3) + 2; // 2-4 entries per day

    for (let i = 0; i < entriesPerDay; i++) {
      const startHour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
      const startMinutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45 minutes
      const duration = (Math.floor(Math.random() * 4) + 1) * 30; // 30min to 2 hours

      const startedAt = addMinutes(addHours(day, startHour), startMinutes);
      const stoppedAt = addMinutes(startedAt, duration);

      entries.push({
        id: `entry-${entries.length + 1}`,
        project: projects[Math.floor(Math.random() * projects.length)],
        startedAt,
        stoppedAt,
      });
    }
  }

  return entries.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
};

const DUMMY_TIME_ENTRIES: ITimeEntry[] = generateDummyTimeEntries();

export { DUMMY_TIME_ENTRIES };
