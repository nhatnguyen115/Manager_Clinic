import { parseISO, formatDistanceToNow as dateFnsFormatDistanceToNow, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Parses a date value from the backend.
 * Handles: ISO strings, Date objects, and Array formats [YYYY, MM, DD, HH, mm, ss]
 */
export const parseBackendDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;

    // Handle Date object
    if (dateValue instanceof Date) return dateValue;

    // Handle Array format [2026, 3, 11, 22, 7, 22]
    if (Array.isArray(dateValue)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
        // JS Date month is 0-indexed, so we subtract 1
        return new Date(year, month - 1, day, hour, minute, second);
    }

    // Handle String format
    if (typeof dateValue === 'string') {
        const date = parseISO(dateValue);
        return isValid(date) ? date : null;
    }

    return null;
};

/**
 * Formats a date relative to now in Vietnamese.
 */
export const formatRelativeTime = (dateValue: any): string => {
    const date = parseBackendDate(dateValue);
    if (!date || !isValid(date)) return '---';

    try {
        return dateFnsFormatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch (error) {
        console.error('Error formatting date:', error);
        return '---';
    }
};
