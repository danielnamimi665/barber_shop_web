import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';
import { parseISO } from 'date-fns';

const TZ = process.env.NEXT_PUBLIC_DEFAULT_TZ || 'Asia/Jerusalem';

/**
 * Convert local date/time to UTC ISO string
 * קלט מהמשתמש לפי אזור זמן מקומי → המרה ל־UTC ISO
 */
export function toUTC(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const utc = zonedTimeToUtc(d, TZ);
  return utc.toISOString();
}

/**
 * Convert UTC ISO string to local Date object
 * ISO ב־UTC → אובייקט Date לפי Jerusalem
 */
export function fromUTC(isoUtc: string): Date {
  const z = utcToZonedTime(isoUtc, TZ);
  return z;
}

/**
 * Format UTC ISO string for local display
 * הצגה מקומית של תאריך מ-UTC
 */
export function formatLocal(isoUtc: string, pattern = "EEEE – d.M.yyyy HH:mm"): string {
  const z = fromUTC(isoUtc);
  return format(z, pattern, { timeZone: TZ });
}

/**
 * Format date for display in Hebrew
 * פורמט תאריך להצגה בעברית
 */
export function formatHebrewDate(isoUtc: string): string {
  const z = fromUTC(isoUtc);
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const dayName = days[z.getDay()];
  const day = z.getDate();
  const month = z.getMonth() + 1;
  const year = z.getFullYear();
  
  return `${dayName}, ${day}/${month}/${year}`;
}

/**
 * Get current date in local timezone as YYYY-MM-DD
 * תאריך נוכחי באזור זמן מקומי
 */
export function getCurrentDateLocal(): string {
  const now = new Date();
  const local = utcToZonedTime(now, TZ);
  return format(local, 'yyyy-MM-dd', { timeZone: TZ });
}

/**
 * Create a date from date string and time string in local timezone
 * יצירת תאריך מתאריך ושעה באזור זמן מקומי
 */
export function createLocalDateTime(dateStr: string, timeStr: string): string {
  // dateStr format: "2025-01-09"
  // timeStr format: "14:30"
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  
  // Create date in local timezone
  const localDate = new Date(year, month - 1, day, hour, minute);
  
  // Convert to UTC
  return toUTC(localDate);
}

/**
 * Check if a date is in the past (local timezone)
 * בדיקה אם תאריך הוא בעבר
 */
export function isDateInPast(dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number);
  const inputDate = new Date(year, month - 1, day);
  const today = utcToZonedTime(new Date(), TZ);
  today.setHours(0, 0, 0, 0);
  
  return inputDate < today;
}

/**
 * Check if a time is in the past for today (local timezone)
 * בדיקה אם שעה היא בעבר להיום
 */
export function isTimeInPast(dateStr: string, timeStr: string): boolean {
  const today = getCurrentDateLocal();
  if (dateStr !== today) {
    return false; // Not today, so time is not in past
  }
  
  const [hour, minute] = timeStr.split(':').map(Number);
  const now = utcToZonedTime(new Date(), TZ);
  const inputTime = new Date(now);
  inputTime.setHours(hour, minute, 0, 0);
  
  return inputTime <= now;
}

/**
 * Get day name in Hebrew from date string
 * קבלת שם יום בעברית מתאריך
 */
export function getHebrewDayName(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  return days[date.getDay()];
}

export { TZ };