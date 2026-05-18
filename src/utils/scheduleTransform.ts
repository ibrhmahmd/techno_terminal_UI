import type { Schedule, ScheduleInput } from '../api/academics/types/groups';

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

/**
 * Convert nested Schedule object to flat form fields for form population
 */
export function scheduleToForm(
  schedule: Schedule,
): { day: string; startTime: string; endTime: string } {
  return {
    day: schedule.day,
    startTime: schedule.start_time,
    endTime: schedule.end_time,
  };
}
