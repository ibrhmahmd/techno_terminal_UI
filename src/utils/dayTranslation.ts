import type { TFunction } from 'i18next';

/**
 * Maps API day names (English) to translation keys
 * Used when the API returns English day names but UI needs translated display
 */
const DAY_TO_KEY: Record<string, string> = {
  Monday: 'days.monday',
  Tuesday: 'days.tuesday',
  Wednesday: 'days.wednesday',
  Thursday: 'days.thursday',
  Friday: 'days.friday',
  Saturday: 'days.saturday',
  Sunday: 'days.sunday',
};

/** Convert English day name to translated display name */
export function translateDay(day: string, t: TFunction): string {
  return t(DAY_TO_KEY[day] || day);
}

/** Convert English day name to translated short name */
export function translateDayShort(day: string, t: TFunction): string {
  return t((DAY_TO_KEY[day] || day).replace('days.', 'days.') + '_short');
}

/** Get all days as { apiName, displayName } using dashboard namespace */
export function getTranslatedDays(t: TFunction) {
  return [
    { api: 'Monday', label: t('dashboard:days.monday') },
    { api: 'Tuesday', label: t('dashboard:days.tuesday') },
    { api: 'Wednesday', label: t('dashboard:days.wednesday') },
    { api: 'Thursday', label: t('dashboard:days.thursday') },
    { api: 'Friday', label: t('dashboard:days.friday') },
    { api: 'Saturday', label: t('dashboard:days.saturday') },
    { api: 'Sunday', label: t('dashboard:days.sunday') },
  ];
}
