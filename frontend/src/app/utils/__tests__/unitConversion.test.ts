import { describe, it, expect } from 'vitest';
import {
    convertUnit,
    formatQuantity,
    getStandardizedQuantity,
    convertBetweenUnits,
} from '../unitConversion';

describe('unitConversion', () => {
    describe('convertUnit', () => {
        it('should not convert grams below threshold', () => {
            const result = convertUnit(500, 'g');
            expect(result.quantity).toBe(500);
            expect(result.unit).toBe('g');
            expect(result.displayText).toBe('500.00 g');
        });

        it('should convert grams to kilograms at threshold', () => {
            const result = convertUnit(1000, 'g');
            expect(result.quantity).toBe(1);
            expect(result.unit).toBe('kg');
            expect(result.displayText).toBe('1.00 kg');
        });

        it('should convert grams to kilograms above threshold', () => {
            const result = convertUnit(1500, 'g');
            expect(result.quantity).toBe(1.5);
            expect(result.unit).toBe('kg');
            expect(result.displayText).toBe('1.50 kg');
        });

        it('should convert large gram amounts correctly', () => {
            const result = convertUnit(2345, 'g');
            expect(result.quantity).toBe(2.345);
            expect(result.unit).toBe('kg');
            expect(result.displayText).toBe('2.35 kg');
        });

        it('should not convert milliliters below threshold', () => {
            const result = convertUnit(750, 'ml');
            expect(result.quantity).toBe(750);
            expect(result.unit).toBe('ml');
            expect(result.displayText).toBe('750.00 ml');
        });

        it('should convert milliliters to liters at threshold', () => {
            const result = convertUnit(1000, 'ml');
            expect(result.quantity).toBe(1);
            expect(result.unit).toBe('L');
            expect(result.displayText).toBe('1.00 L');
        });

        it('should convert milliliters to liters above threshold', () => {
            const result = convertUnit(2500, 'ml');
            expect(result.quantity).toBe(2.5);
            expect(result.unit).toBe('L');
            expect(result.displayText).toBe('2.50 L');
        });

        it('should not convert units that are already in kg', () => {
            const result = convertUnit(2.5, 'kg');
            expect(result.quantity).toBe(2.5);
            expect(result.unit).toBe('kg');
            expect(result.displayText).toBe('2.50 kg');
        });

        it('should not convert units that are already in L', () => {
            const result = convertUnit(3.75, 'L');
            expect(result.quantity).toBe(3.75);
            expect(result.unit).toBe('L');
            expect(result.displayText).toBe('3.75 L');
        });

        it('should handle custom threshold', () => {
            const result = convertUnit(500, 'g', 500);
            expect(result.quantity).toBe(0.5);
            expect(result.unit).toBe('kg');
            expect(result.displayText).toBe('0.50 kg');
        });

        it('should handle zero quantity', () => {
            const result = convertUnit(0, 'g');
            expect(result.quantity).toBe(0);
            expect(result.unit).toBe('g');
            expect(result.displayText).toBe('0.00 g');
        });

        it('should handle boundary case: 999g should not convert', () => {
            const result = convertUnit(999, 'g');
            expect(result.quantity).toBe(999);
            expect(result.unit).toBe('g');
        });

        it('should handle boundary case: 1001g should convert', () => {
            const result = convertUnit(1001, 'g');
            expect(result.quantity).toBe(1.001);
            expect(result.unit).toBe('kg');
        });

        it('should handle unknown units by keeping them unchanged', () => {
            const result = convertUnit(5, 'plate');
            expect(result.quantity).toBe(5);
            expect(result.unit).toBe('plate');
            expect(result.displayText).toBe('5.00 plate');
        });
    });

    describe('formatQuantity', () => {
        it('should format quantity with default 2 decimal places', () => {
            const result = formatQuantity(1500, 'g');
            expect(result).toBe('1.50 kg');
        });

        it('should format quantity with custom decimal places', () => {
            const result = formatQuantity(1500, 'g', 3);
            expect(result).toBe('1.500 kg');
        });

        it('should format quantity with zero decimal places', () => {
            const result = formatQuantity(2000, 'g', 0);
            expect(result).toBe('2 kg');
        });

        it('should format small quantities without conversion', () => {
            const result = formatQuantity(250, 'g');
            expect(result).toBe('250.00 g');
        });

        it('should format milliliters', () => {
            const result = formatQuantity(3500, 'ml');
            expect(result).toBe('3.50 L');
        });
    });

    describe('getStandardizedQuantity', () => {
        it('should convert grams to kilograms', () => {
            const result = getStandardizedQuantity(1000, 'g');
            expect(result).toBe(1);
        });

        it('should convert partial grams to kilograms', () => {
            const result = getStandardizedQuantity(250, 'g');
            expect(result).toBe(0.25);
        });

        it('should convert milliliters to liters', () => {
            const result = getStandardizedQuantity(2000, 'ml');
            expect(result).toBe(2);
        });

        it('should convert partial milliliters to liters', () => {
            const result = getStandardizedQuantity(500, 'ml');
            expect(result).toBe(0.5);
        });

        it('should keep kg unchanged', () => {
            const result = getStandardizedQuantity(2.5, 'kg');
            expect(result).toBe(2.5);
        });

        it('should keep L unchanged', () => {
            const result = getStandardizedQuantity(1.75, 'L');
            expect(result).toBe(1.75);
        });

        it('should handle zero quantity', () => {
            const result = getStandardizedQuantity(0, 'g');
            expect(result).toBe(0);
        });

        it('should handle plate unit unchanged', () => {
            const result = getStandardizedQuantity(5, 'plate');
            expect(result).toBe(5);
        });
    });

    describe('convertBetweenUnits', () => {
        it('should return same quantity for same units', () => {
            const result = convertBetweenUnits(100, 'g', 'g');
            expect(result).toBe(100);
        });

        it('should convert grams to kilograms', () => {
            const result = convertBetweenUnits(1000, 'g', 'kg');
            expect(result).toBe(1);
        });

        it('should convert kilograms to grams', () => {
            const result = convertBetweenUnits(1.5, 'kg', 'g');
            expect(result).toBe(1500);
        });

        it('should convert milliliters to liters', () => {
            const result = convertBetweenUnits(2000, 'ml', 'L');
            expect(result).toBe(2);
        });

        it('should convert liters to milliliters', () => {
            const result = convertBetweenUnits(0.5, 'L', 'ml');
            expect(result).toBe(500);
        });

        it('should keep kg to kg unchanged', () => {
            const result = convertBetweenUnits(3.5, 'kg', 'kg');
            expect(result).toBe(3.5);
        });

        it('should keep L to L unchanged', () => {
            const result = convertBetweenUnits(2.25, 'L', 'L');
            expect(result).toBe(2.25);
        });

        it('should handle zero conversion', () => {
            const result = convertBetweenUnits(0, 'g', 'kg');
            expect(result).toBe(0);
        });

        it('should handle partial units when converting up', () => {
            const result = convertBetweenUnits(250, 'g', 'kg');
            expect(result).toBe(0.25);
        });

        it('should handle partial units when converting down', () => {
            const result = convertBetweenUnits(0.75, 'kg', 'g');
            expect(result).toBe(750);
        });
    });
});
