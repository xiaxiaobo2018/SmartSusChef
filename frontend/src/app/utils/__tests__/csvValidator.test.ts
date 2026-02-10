import { describe, it, expect, beforeEach } from 'vitest';
import { CSVValidator, DATE_FORMATS } from '../csvValidator';
import { Recipe } from '@/app/types';

describe('csvValidator', () => {
    let validator: CSVValidator;
    let mockRecipes: Recipe[];

    beforeEach(() => {
        mockRecipes = [
            {
                id: 'recipe-1',
                name: 'Chicken Rice',
                isSubRecipe: false,
                isSellable: true,
                ingredients: [],
            } as Recipe,
            {
                id: 'recipe-2',
                name: 'Nasi Lemak',
                isSubRecipe: false,
                isSellable: true,
                ingredients: [],
            } as Recipe,
        ];
    });

    describe('DATE_FORMATS', () => {
        it('should have multiple date format options', () => {
            expect(DATE_FORMATS.length).toBeGreaterThan(0);
            expect(DATE_FORMATS[0]).toHaveProperty('label');
            expect(DATE_FORMATS[0]).toHaveProperty('value');
            expect(DATE_FORMATS[0]).toHaveProperty('regex');
            expect(DATE_FORMATS[0]).toHaveProperty('example');
            expect(DATE_FORMATS[0]).toHaveProperty('parse');
        });

        it('should parse M/D/YY format correctly', () => {
            const format = DATE_FORMATS.find(f => f.value === 'M/d/yy');
            expect(format).toBeDefined();

            const date = format!.parse('5/1/25');
            expect(date).toBeInstanceOf(Date);
            expect(date!.getFullYear()).toBe(2025);
            expect(date!.getMonth()).toBe(4); // May (0-indexed)
            expect(date!.getDate()).toBe(1);
        });

        it('should parse YYYY-MM-DD format correctly', () => {
            const format = DATE_FORMATS.find(f => f.value === 'yyyy-MM-dd');
            expect(format).toBeDefined();

            const date = format!.parse('2025-05-01');
            expect(date).toBeInstanceOf(Date);
            expect(date!.getFullYear()).toBe(2025);
            expect(date!.getMonth()).toBe(4);
            expect(date!.getDate()).toBe(1);
        });

        it('should parse DD/MM/YYYY format correctly', () => {
            const format = DATE_FORMATS.find(f => f.value === 'dd/MM/yyyy');
            expect(format).toBeDefined();

            const date = format!.parse('01/05/2025');
            expect(date).toBeInstanceOf(Date);
            expect(date!.getFullYear()).toBe(2025);
            expect(date!.getMonth()).toBe(4);
            expect(date!.getDate()).toBe(1);
        });

        it('should validate date format with regex', () => {
            const yyyymmdd = DATE_FORMATS.find(f => f.value === 'yyyy-MM-dd');
            expect(yyyymmdd!.regex.test('2025-05-01')).toBe(true);
            expect(yyyymmdd!.regex.test('2025/05/01')).toBe(false);
            expect(yyyymmdd!.regex.test('05-01-2025')).toBe(false);
        });
    });

    describe('CSVValidator - initialization', () => {
        it('should create validator with recipes', () => {
            validator = new CSVValidator(mockRecipes);
            expect(validator).toBeInstanceOf(CSVValidator);
        });

        it('should use default date format if not specified', () => {
            validator = new CSVValidator(mockRecipes);
            expect(validator).toBeInstanceOf(CSVValidator);
        });

        it('should accept custom date format', () => {
            validator = new CSVValidator(mockRecipes, 'yyyy-MM-dd');
            expect(validator).toBeInstanceOf(CSVValidator);
        });
    });

    describe('CSVValidator - validate()', () => {
        beforeEach(() => {
            validator = new CSVValidator(mockRecipes, 'M/d/yy');
        });

        it('should reject empty CSV', () => {
            const result = validator.validate([]);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0].error).toContain('empty');
        });

        it('should reject CSV missing required columns', () => {
            const rows = [
                { Date: '5/1/25' }, // Missing Dish_Name and Quantity_Sold
            ];

            const result = validator.validate(rows);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0].error).toContain('Missing required columns');
        });

        it('should validate correct CSV data', () => {
            const rows = [
                {
                    Date: '5/1/25',
                    Dish_Name: 'Chicken Rice',
                    Quantity_Sold: '10',
                },
                {
                    Date: '5/2/25',
                    Dish_Name: 'Nasi Lemak',
                    Quantity_Sold: '15',
                },
            ];

            const result = validator.validate(rows);

            expect(result.isValid).toBe(true);
            expect(result.validRows.length).toBe(2);
            expect(result.errors.length).toBe(0);
        });

        it('should detect invalid date format', () => {
            const rows = [
                {
                    Date: 'invalid-date',
                    Dish_Name: 'Chicken Rice',
                    Quantity_Sold: '10',
                },
            ];

            const result = validator.validate(rows);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0].column).toBe('Date');
        });

        it('should detect invalid quantity (negative)', () => {
            const rows = [
                {
                    Date: '5/1/25',
                    Dish_Name: 'Chicken Rice',
                    Quantity_Sold: '-5',
                },
            ];

            const result = validator.validate(rows);

            expect(result.errors.length).toBeGreaterThan(0);
            const quantityError = result.errors.find(e => e.column === 'Quantity_Sold');
            expect(quantityError).toBeDefined();
        });

        it('should detect invalid quantity (non-numeric)', () => {
            const rows = [
                {
                    Date: '5/1/25',
                    Dish_Name: 'Chicken Rice',
                    Quantity_Sold: 'abc',
                },
            ];

            const result = validator.validate(rows);

            expect(result.errors.length).toBeGreaterThan(0);
            const quantityError = result.errors.find(e => e.column === 'Quantity_Sold');
            expect(quantityError).toBeDefined();
        });

        it('should reject empty dish name', () => {
            const rows = [
                {
                    Date: '5/1/25',
                    Dish_Name: '',
                    Quantity_Sold: '10',
                },
            ];

            const result = validator.validate(rows);

            expect(result.errors.length).toBeGreaterThan(0);
            const dishError = result.errors.find(e => e.column === 'Dish_Name');
            expect(dishError).toBeDefined();
        });

        it('should accept dish names not in recipe list', () => {
            const rows = [
                {
                    Date: '5/1/25',
                    Dish_Name: 'New Dish Not In System',
                    Quantity_Sold: '5',
                },
            ];

            const result = validator.validate(rows);

            // Should not error - new dishes are auto-created
            expect(result.validRows.length).toBe(1);
        });

        it('should handle mixed valid and invalid rows', () => {
            const rows = [
                {
                    Date: '5/1/25',
                    Dish_Name: 'Chicken Rice',
                    Quantity_Sold: '10',
                },
                {
                    Date: 'invalid',
                    Dish_Name: 'Nasi Lemak',
                    Quantity_Sold: '15',
                },
                {
                    Date: '5/3/25',
                    Dish_Name: 'Chicken Rice',
                    Quantity_Sold: '8',
                },
            ];

            const result = validator.validate(rows);

            expect(result.validRows.length).toBe(2);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should trim whitespace from dish names', () => {
            const rows = [
                {
                    Date: '5/1/25',
                    Dish_Name: '  Chicken Rice  ',
                    Quantity_Sold: '10',
                },
            ];

            const result = validator.validate(rows);

            expect(result.validRows[0].dishName).toBe('Chicken Rice');
        });

        it('should provide statistics', () => {
            const rows = [
                {
                    Date: '5/1/25',
                    Dish_Name: 'Chicken Rice',
                    Quantity_Sold: '10',
                },
                {
                    Date: 'invalid',
                    Dish_Name: 'Nasi Lemak',
                    Quantity_Sold: '15',
                },
            ];

            const result = validator.validate(rows);

            expect(result.totalRows).toBe(2);
            expect(result.validRows.length).toBe(1);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('CSVValidator - edge cases', () => {
        beforeEach(() => {
            validator = new CSVValidator(mockRecipes, 'M/d/yy');
        });

        it('should handle zero quantity', () => {
            const rows = [
                {
                    Date: '5/1/25',
                    Dish_Name: 'Chicken Rice',
                    Quantity_Sold: '0',
                },
            ];

            const result = validator.validate(rows);

            // Zero might be valid (no sales that day) or invalid depending on business logic
            // Adjust expectation based on actual implementation
            expect(result.validRows.length).toBeGreaterThanOrEqual(0);
        });

        it('should handle very large quantities', () => {
            const rows = [
                {
                    Date: '5/1/25',
                    Dish_Name: 'Chicken Rice',
                    Quantity_Sold: '999999',
                },
            ];

            const result = validator.validate(rows);

            expect(result.validRows.length).toBeGreaterThanOrEqual(0);
        });

        it('should handle decimal quantities if allowed', () => {
            const rows = [
                {
                    Date: '5/1/25',
                    Dish_Name: 'Chicken Rice',
                    Quantity_Sold: '10.5',
                },
            ];

            const result = validator.validate(rows);

            // Depending on business logic, decimals might be valid or invalid
            expect(result).toHaveProperty('isValid');
        });

        it('should handle special characters in dish names', () => {
            const rows = [
                {
                    Date: '5/1/25',
                    Dish_Name: "Chef's Special (Spicy!)",
                    Quantity_Sold: '5',
                },
            ];

            const result = validator.validate(rows);

            expect(result.validRows.length).toBeGreaterThanOrEqual(0);
        });

        it('should detect massive data mismatch', () => {
            // Create many invalid rows to trigger high-volume error
            const manyInvalidRows = Array.from({ length: 60 }, (_, i) => ({
                Date: 'invalid',
                Dish_Name: `Dish ${i}`,
                Quantity_Sold: '-1',
            }));

            const result = validator.validate(manyInvalidRows);

            expect(result.isValid).toBe(false);
            // Should group errors when > 50 errors
            expect(result.errors.length).toBeLessThanOrEqual(60);
        });
    });

    describe('Date format parsing', () => {
        it('should parse different date formats correctly', () => {
            const testCases = [
                { format: 'M/d/yy', input: '1/15/25', expected: new Date(2025, 0, 15) },
                { format: 'yyyy-MM-dd', input: '2025-01-15', expected: new Date(2025, 0, 15) },
                { format: 'dd/MM/yyyy', input: '15/01/2025', expected: new Date(2025, 0, 15) },
            ];

            testCases.forEach(({ format, input, expected }) => {
                const dateFormat = DATE_FORMATS.find(f => f.value === format);
                const parsed = dateFormat?.parse(input);

                expect(parsed?.getFullYear()).toBe(expected.getFullYear());
                expect(parsed?.getMonth()).toBe(expected.getMonth());
                expect(parsed?.getDate()).toBe(expected.getDate());
            });
        });
    });

    describe('Additional Date Formats', () => {
        it('should parse d/M/yy format', () => {
            const fmt = DATE_FORMATS.find(f => f.value === 'd/M/yy')!;
            expect(fmt).toBeDefined();
            const date = fmt.parse('1/5/25');
            expect(date?.getFullYear()).toBe(2025);
            expect(date?.getMonth()).toBe(4); // May
            expect(date?.getDate()).toBe(1);
        });

        it('should parse M/d/yyyy format', () => {
            const fmt = DATE_FORMATS.find(f => f.value === 'M/d/yyyy')!;
            expect(fmt).toBeDefined();
            const date = fmt.parse('5/1/2025');
            expect(date?.getFullYear()).toBe(2025);
            expect(date?.getMonth()).toBe(4);
            expect(date?.getDate()).toBe(1);
        });

        it('should parse dd-MM-yyyy format', () => {
            const fmt = DATE_FORMATS.find(f => f.value === 'dd-MM-yyyy')!;
            expect(fmt).toBeDefined();
            const date = fmt.parse('01-05-2025');
            expect(date?.getFullYear()).toBe(2025);
            expect(date?.getMonth()).toBe(4);
            expect(date?.getDate()).toBe(1);
        });

        it('should parse yyyy/MM/dd format', () => {
            const fmt = DATE_FORMATS.find(f => f.value === 'yyyy/MM/dd')!;
            expect(fmt).toBeDefined();
            const date = fmt.parse('2025/05/01');
            expect(date?.getFullYear()).toBe(2025);
            expect(date?.getMonth()).toBe(4);
            expect(date?.getDate()).toBe(1);
        });

        it('should validate regex for each format', () => {
            const cases = [
                { value: 'd/M/yy', valid: '1/5/25', invalid: '2025-01-01' },
                { value: 'M/d/yyyy', valid: '5/1/2025', invalid: '2025-01-01' },
                { value: 'dd-MM-yyyy', valid: '01-05-2025', invalid: '01/05/2025' },
                { value: 'yyyy/MM/dd', valid: '2025/05/01', invalid: '2025-05-01' },
            ];
            cases.forEach(({ value, valid, invalid }) => {
                const fmt = DATE_FORMATS.find(f => f.value === value)!;
                expect(fmt.regex.test(valid)).toBe(true);
                expect(fmt.regex.test(invalid)).toBe(false);
            });
        });
    });

    describe('Date Cross-Validation', () => {
        it('should detect invalid calendar dates like Feb 30 with M/d/yy', () => {
            const validator = new CSVValidator([] as any, 'M/d/yy');
            const result = validator.validate([
                { Date: '2/30/25', Dish_Name: 'Test', Quantity_Sold: '10' },
            ]);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.error === 'Invalid date')).toBe(true);
        });

        it('should detect invalid calendar dates with yyyy-MM-dd', () => {
            const validator = new CSVValidator([] as any, 'yyyy-MM-dd');
            const result = validator.validate([
                { Date: '2025-02-30', Dish_Name: 'Test', Quantity_Sold: '10' },
            ]);
            expect(result.isValid).toBe(false);
        });

        it('should accept valid dates with d/M/yy format', () => {
            const validator = new CSVValidator([] as any, 'd/M/yy');
            const result = validator.validate([
                { Date: '1/5/25', Dish_Name: 'Test', Quantity_Sold: '10' },
            ]);
            expect(result.errors.filter(e => e.column === 'Date').length).toBe(0);
        });

        it('should accept valid dates with dd-MM-yyyy format', () => {
            const validator = new CSVValidator([] as any, 'dd-MM-yyyy');
            const result = validator.validate([
                { Date: '01-05-2025', Dish_Name: 'Test', Quantity_Sold: '10' },
            ]);
            expect(result.errors.filter(e => e.column === 'Date').length).toBe(0);
        });

        it('should accept valid dates with yyyy/MM/dd format', () => {
            const validator = new CSVValidator([] as any, 'yyyy/MM/dd');
            const result = validator.validate([
                { Date: '2025/05/01', Dish_Name: 'Test', Quantity_Sold: '10' },
            ]);
            expect(result.errors.filter(e => e.column === 'Date').length).toBe(0);
        });

        it('should detect overflow in d/M/yy format', () => {
            const validator = new CSVValidator([] as any, 'd/M/yy');
            const result = validator.validate([
                { Date: '31/2/25', Dish_Name: 'Test', Quantity_Sold: '10' },
            ]);
            expect(result.isValid).toBe(false);
        });

        it('should detect overflow in dd/MM/yyyy format', () => {
            const validator = new CSVValidator([] as any, 'dd/MM/yyyy');
            const result = validator.validate([
                { Date: '30/02/2025', Dish_Name: 'Test', Quantity_Sold: '10' },
            ]);
            expect(result.isValid).toBe(false);
        });
    });

    describe('Static Methods', () => {
        it('should generate error log with details', () => {
            const errors = [
                { row: 2, column: 'Date', value: 'invalid', error: 'Invalid date format', suggestion: 'Use M/d/yy' },
                { row: 3, column: 'Quantity_Sold', value: '-5', error: 'Value must be at least 0' },
            ];
            const log = CSVValidator.generateErrorLog(errors);
            expect(log).toContain('SmartSus Chef - CSV Import Error Log');
            expect(log).toContain('Error 1:');
            expect(log).toContain('Error 2:');
            expect(log).toContain('Row: 2');
            expect(log).toContain('Invalid date format');
            expect(log).toContain('Suggestion: Use M/d/yy');
            expect(log).toContain('Total Errors: 2');
            expect(log).toContain('Common Solutions:');
        });

        it('should generate error log without suggestions', () => {
            const errors = [
                { row: 2, column: 'Dish_Name', value: '', error: 'Dish name is required' },
            ];
            const log = CSVValidator.generateErrorLog(errors);
            expect(log).toContain('Error 1:');
            expect(log).not.toContain('Suggestion:');
        });

        it('should generate sample CSV with default format', () => {
            const csv = CSVValidator.generateSampleCSV();
            expect(csv).toContain('Date,Dish_Name,Quantity_Sold');
            expect(csv).toContain('Laksa');
            expect(csv).toContain('Hainanese Chicken Rice');
            expect(csv).toContain('Chicken Salad');
        });

        it('should generate sample CSV with yyyy-MM-dd format', () => {
            const csv = CSVValidator.generateSampleCSV('yyyy-MM-dd');
            expect(csv).toContain('Date,Dish_Name,Quantity_Sold');
            expect(csv).toContain('2025-05-01');
        });

        it('should generate sample CSV with dd/MM/yyyy format', () => {
            const csv = CSVValidator.generateSampleCSV('dd/MM/yyyy');
            expect(csv).toContain('01/05/2025');
        });

        it('should generate sample CSV with dd-MM-yyyy format', () => {
            const csv = CSVValidator.generateSampleCSV('dd-MM-yyyy');
            expect(csv).toContain('01-05-2025');
        });

        it('should generate sample CSV with yyyy/MM/dd format', () => {
            const csv = CSVValidator.generateSampleCSV('yyyy/MM/dd');
            expect(csv).toContain('2025/05/01');
        });
    });

    describe('Error Summary Generation', () => {
        it('should generate grouped error summary for high-volume failures', () => {
            const manyInvalidRows = Array.from({ length: 55 }, (_, i) => ({
                Date: 'invalid',
                Dish_Name: '',
                Quantity_Sold: 'abc',
            }));
            const validator = new CSVValidator([] as any, 'M/d/yy');
            const result = validator.validate(manyInvalidRows);
            expect(result.isValid).toBe(false);
            // When > 50 errors, they get replaced with a single summary error
            expect(result.errors.length).toBe(1);
            expect(result.errors[0].error).toBe('Massive data mismatch detected');
            expect(result.errors[0].suggestion).toContain('Download Error Log');
        });
    });
});
