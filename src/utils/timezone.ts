import moment from 'moment-timezone';

/**
 * Get the browser's current timezone offset in ISO format (e.g., +05:45, +10:00)
 */
export const getCurrentTimezoneOffset = (): string => {
    const browserTimezone = moment.tz.guess();
    const currentTime = moment.tz(browserTimezone);
    return currentTime.format('Z');
};

/**
 * Get the browser's current timezone name (e.g., "Asia/Kathmandu", "Australia/Sydney")
 */
export const getCurrentTimezoneName = (): string => {
    return moment.tz.guess();
};

/**
 * Format a timezone offset for display (e.g., "UTC+05:45")
 */
export const formatTimezoneDisplay = (): string => {
    const offset = getCurrentTimezoneOffset();
    return `UTC${offset}`;
};

/**
 * Get current time in browser's timezone
 */
export const getCurrentLocalTime = () => {
    const browserTimezone = moment.tz.guess();
    return moment.tz(browserTimezone);
};

/**
 * Format a date to browser's timezone with specific format
 */
export const formatToLocalTimezone = (date: string | Date, format: string = 'YYYY-MM-DDTHH:mm:ssZ') => {
    const browserTimezone = moment.tz.guess();
    return moment.tz(date, browserTimezone).format(format);
};