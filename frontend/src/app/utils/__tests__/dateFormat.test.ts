import { describe, it, expect } from 'vitest';
import {
    formatSingaporeDate,
    formatSingaporeDateTime,
    formatShortDate,
    formatDateWithDay,
    formatDateTimeLog,
} from '../dateFormat';

describe('dateFormat', () => {
    describe('formatSingaporeDate', () => {
        it('should format Date object to Singapore date format', () => {
            const date = new Date('2026-01-18T10:30:00Z');
            const result = formatSingaporeDate(date);
            // Format: "d MMM yyyy"
            expect(result).toMatch(/^\d{1,2} \w{3} \d{4}$/);
            expect(result).toContain('Jan');
            expect(result).toContain('2026');
        });

        it('should format ISO string to Singapore date format', () => {
            const result = formatSingaporeDate('2026-01-18');
            expect(result).toMatch(/^\d{1,2} \w{3} \d{4}$/);
            expect(result).toContain('Jan');
            expect(result).toContain('2026');
        });

        it('should handle different months correctly', () => {
            const result = formatSingaporeDate('2026-02-09');
            expect(result).toContain('Feb');
            expect(result).toContain('2026');
        });

        it('should format single-digit days without leading zero', () => {
            const result = formatSingaporeDate('2026-01-05');
            expect(result).toMatch(/^5 Jan 2026$/);
        });

        it('should format double-digit days correctly', () => {
            const result = formatSingaporeDate('2026-01-18');
            expect(result).toMatch(/^18 Jan 2026$/);
        });
    });

    describe('formatSingaporeDateTime', () => {
        it('should format Date object with time in 12-hour format', () => {
            const date = new Date('2026-01-18T14:30:00');
            const result = formatSingaporeDateTime(date);
            // Format: "d MMM yyyy, h:mm a"
            expect(result).toMatch(/^\d{1,2} \w{3} \d{4}, \d{1,2}:\d{2} (AM|PM)$/);
            expect(result).toContain('2026');
        });

        it('should format string date with time', () => {
            const result = formatSingaporeDateTime('2026-02-09T09:15:00');
            expect(result).toContain('Feb');
            expect(result).toContain('2026');
            expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)$/);
        });

        it('should show PM for afternoon times', () => {
            const date = new Date('2026-01-18T14:30:00');
            const result = formatSingaporeDateTime(date);
            expect(result).toContain('PM');
        });

        it('should show AM for morning times', () => {
            const date = new Date('2026-01-18T09:30:00');
            const result = formatSingaporeDateTime(date);
            expect(result).toContain('AM');
        });
    });

    describe('formatShortDate', () => {
        it('should format to short date without year', () => {
            const date = new Date('2026-01-18');
            const result = formatShortDate(date);
            // Format: "d MMM"
            expect(result).toMatch(/^\d{1,2} \w{3}$/);
            expect(result).toContain('Jan');
            expect(result).not.toContain('2026');
        });

        it('should format ISO string to short date', () => {
            const result = formatShortDate('2026-02-09');
            expect(result).toMatch(/^9 Feb$/);
        });

        it('should handle different months', () => {
            const result = formatShortDate('2026-12-25');
            expect(result).toContain('Dec');
            expect(result).toContain('25');
        });

        it('should format single-digit days correctly', () => {
            const result = formatShortDate('2026-03-05');
            expect(result).toMatch(/^5 Mar$/);
        });
    });

    describe('formatDateWithDay', () => {
        it('should format with day of week', () => {
            const date = new Date('2026-01-18');
            const result = formatDateWithDay(date);
            // Format: "EEE, d MMM yyyy"
            expect(result).toMatch(/^\w{3}, \d{1,2} \w{3} \d{4}$/);
            expect(result).toContain('Jan');
            expect(result).toContain('2026');
        });

        it('should include abbreviated day name', () => {
            const result = formatDateWithDay('2026-02-09');
            // Should start with 3-letter day abbreviation
            expect(result).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),/);
        });

        it('should format ISO string correctly', () => {
            const result = formatDateWithDay('2026-01-01');
            expect(result).toContain('2026');
            expect(result).toContain('Jan');
            expect(result).toContain(',');
        });
    });

    describe('formatDateTimeLog', () => {
        it('should format with 24-hour time', () => {
            const date = new Date('2026-01-18T14:30:00');
            const result = formatDateTimeLog(date);
            // Format: "d MMM yyyy, HH:mm"
            expect(result).toMatch(/^\d{1,2} \w{3} \d{4}, \d{2}:\d{2}$/);
            expect(result).toContain('14:30');
        });

        it('should use 24-hour format for afternoon', () => {
            const date = new Date('2026-01-18T15:45:00');
            const result = formatDateTimeLog(date);
            expect(result).toContain('15:45');
            expect(result).not.toContain('PM');
        });

        it('should use 24-hour format for morning with leading zeros', () => {
            const date = new Date('2026-01-18T09:05:00');
            const result = formatDateTimeLog(date);
            expect(result).toContain('09:05');
        });

        it('should format ISO string correctly', () => {
            const result = formatDateTimeLog('2026-02-09T23:59:00');
            expect(result).toContain('Feb');
            expect(result).toContain('2026');
            expect(result).toContain('23:59');
        });

        it('should handle midnight correctly', () => {
            const date = new Date('2026-01-18T00:15:00');
            const result = formatDateTimeLog(date);
            expect(result).toContain('00:15');
        });

        it('should handle noon correctly', () => {
            const date = new Date('2026-01-18T12:00:00');
            const result = formatDateTimeLog(date);
            expect(result).toContain('12:00');
        });
    });

    describe('Edge cases', () => {
        it('should handle end of year dates', () => {
            const result = formatSingaporeDate('2025-12-31');
            expect(result).toContain('Dec');
            expect(result).toContain('2025');
            expect(result).toContain('31');
        });

        it('should handle start of year dates', () => {
            const result = formatSingaporeDate('2026-01-01');
            expect(result).toContain('Jan');
            expect(result).toContain('2026');
            expect(result).toContain('1');
        });

        it('should handle leap year dates', () => {
            const result = formatSingaporeDate('2024-02-29');
            expect(result).toContain('Feb');
            expect(result).toContain('29');
        });
    });
});
