import type { ScheduleInput } from '../api/academics/types/groups';

/**
 * Convert flat form fields to nested ScheduleInput object for API submission
 */
export function formToSchedule(
  day: string,
  startTime: string,
  endTime: string,
): ScheduleInput {
  return {
    day,
    time_start: startTime,
    time_end: endTime,
  };
}
