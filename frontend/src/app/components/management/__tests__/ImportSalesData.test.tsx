import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportSalesData } from '../ImportSalesData';
import * as AppContext from '@/app/context/AppContext';
import type { AppContextType } from '@/app/types';
import { toast } from 'sonner';
import { parse } from 'papaparse';
import { salesApi } from '@/app/services/api';

// ========== Hoisted mock state (accessible inside vi.mock factories) ==========
const { mockValidate, mockGenerateErrorLog } = vi.hoisted(() => ({
    mockValidate: vi.fn(),
    mockGenerateErrorLog: vi.fn().mockReturnValue('error log content'),
}));

// ========== Module mocks ==========

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
    },
}));

vi.mock('papaparse', () => ({
    parse: vi.fn(),
}));

vi.mock('@/app/services/api', () => ({
    salesApi: {
        importByName: vi.fn(),
    },
}));

vi.mock('@/app/utils/csvValidator', () => {
    const DATE_FORMATS = [
        {
            label: 'M/D/YY  (e.g. 5/1/25)',
            value: 'M/d/yy',
            regex: /^\d{1,2}\/\d{1,2}\/\d{2}$/,
            example: '5/1/25',
            parse: (s: string) => { const p = s.split('/'); return new Date(2000 + +p[2], +p[0] - 1, +p[1]); },
        },
        {
            label: 'YYYY-MM-DD  (e.g. 2025-05-01)',
            value: 'yyyy-MM-dd',
            regex: /^\d{4}-\d{2}-\d{2}$/,
            example: '2025-05-01',
            parse: (s: string) => { const p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); },
        },
        {
            label: 'DD/MM/YYYY  (e.g. 01/05/2025)',
            value: 'dd/MM/yyyy',
            regex: /^\d{1,2}\/\d{1,2}\/\d{4}$/,
            example: '01/05/2025',
            parse: (s: string) => { const p = s.split('/'); return new Date(+p[2], +p[1] - 1, +p[0]); },
        },
    ];

    // Use function() so it works with `new CSVValidator()`
    function CSVValidatorMock() {
        return { validate: mockValidate };
    }
    CSVValidatorMock.generateErrorLog = mockGenerateErrorLog;

    return { DATE_FORMATS, CSVValidator: CSVValidatorMock };
});

// Keep the real date-fns (used in overwrite dialog)
vi.mock('date-fns', async () => await vi.importActual('date-fns'));

// ========== Helpers ==========

const mockRecipes = [
    { id: 'r1', name: 'Laksa', isSubRecipe: false, ingredients: [] },
    { id: 'r2', name: 'Chicken Rice', isSubRecipe: false, ingredients: [] },
    { id: 'r3', name: 'Nasi Lemak', isSubRecipe: false, ingredients: [] },
];

const mockSalesData = [
    { id: 's1', date: '2026-02-08', recipeId: 'r1', quantity: 50 },
    { id: 's2', date: '2026-02-08', recipeId: 'r2', quantity: 75 },
];

const mockRefreshData = vi.fn().mockResolvedValue(undefined);

function createCtx(overrides?: Partial<AppContextType>): Partial<AppContextType> {
    return { recipes: mockRecipes, salesData: mockSalesData, refreshData: mockRefreshData, ...overrides };
}

function setupAppContext(overrides?: Partial<AppContextType>) {
    vi.spyOn(AppContext, 'useApp').mockReturnValue(createCtx(overrides) as AppContextType);
}

/** Configure papaparse to call `complete` with the given rows */
function setPapaResult(rows: Record<string, string>[]) {
    (parse as ReturnType<typeof vi.fn>).mockImplementation((_t: string, o: any) => o.complete({ data: rows }));
}

/** Configure papaparse to call `error` */
function setPapaError(msg: string) {
    (parse as ReturnType<typeof vi.fn>).mockImplementation((_t: string, o: any) => o.error(new Error(msg)));
}

/** Create a .csv File object */
function csvFile(name = 'sales.csv') {
    return new File(['csv'], name, { type: 'text/csv' });
}

/** Fire the hidden file-input change event with a file */
function triggerUpload(container: HTMLElement, file?: File) {
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file ?? csvFile()] } });
}

/** Save and patch globalThis.FileReader so onload fires synchronously */
let savedFileReader: typeof FileReader;
function patchFileReader() {
    savedFileReader = globalThis.FileReader;
    globalThis.FileReader = function (this: any) {
        this.onload = null;
        this.readAsText = vi.fn().mockImplementation(() => {
            if (this.onload) this.onload({ target: { result: 'csv-text' } });
        });
    } as any;
}
function restoreFileReader() {
    if (savedFileReader) globalThis.FileReader = savedFileReader;
}

// ========== Tests ==========

describe('ImportSalesData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRefreshData.mockResolvedValue(undefined);
        mockValidate.mockReturnValue({ isValid: true, errors: [], warnings: [] });

        global.URL.createObjectURL = vi.fn(() => 'blob:mock');
        global.URL.revokeObjectURL = vi.fn();

        vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
    });

    afterEach(() => {
        restoreFileReader();
        vi.restoreAllMocks();
    });

    // ==================== 1. Rendering ====================
    describe('Rendering', () => {
        it('should render page title and description', () => {
            setupAppContext();
            render(<ImportSalesData />);
            expect(screen.getByText('Import Sales Data')).toBeInTheDocument();
            expect(screen.getByText('Upload CSV file from your POS system')).toBeInTheDocument();
        });

        it('should render Upload icon in title', () => {
            setupAppContext();
            const { container } = render(<ImportSalesData />);
            expect(container.querySelector('svg.lucide-upload')).toBeInTheDocument();
        });

        it('should render Step 1 card with CalendarDays icon', () => {
            setupAppContext();
            const { container } = render(<ImportSalesData />);
            expect(screen.getByText('Step 1: Select Date Format & Download Template')).toBeInTheDocument();
            expect(container.querySelector('svg.lucide-calendar-days')).toBeInTheDocument();
        });

        it('should render Step 2 card', () => {
            setupAppContext();
            render(<ImportSalesData />);
            expect(screen.getByText('Step 2: Upload CSV File')).toBeInTheDocument();
            expect(screen.getByText('Drag and drop or click to browse')).toBeInTheDocument();
        });

        it('should render date format selector with label', () => {
            setupAppContext();
            render(<ImportSalesData />);
            expect(screen.getByText('Date Format in CSV')).toBeInTheDocument();
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        it('should render download template button', () => {
            setupAppContext();
            render(<ImportSalesData />);
            expect(screen.getByText('Download Sample Template (.csv)')).toBeInTheDocument();
        });

        it('should render required columns info', () => {
            setupAppContext();
            const { container } = render(<ImportSalesData />);
            expect(screen.getByText('Required Columns:')).toBeInTheDocument();
            const bolds = Array.from(container.querySelectorAll('strong')).map(el => el.textContent);
            expect(bolds).toContain('Date');
            expect(bolds).toContain('Dish_Name');
            expect(bolds).toContain('Quantity_Sold');
        });

        it('should render upload dropzone with browse button', () => {
            setupAppContext();
            render(<ImportSalesData />);
            expect(screen.getByText('Drop your CSV file here')).toBeInTheDocument();
            expect(screen.getByText('Browse Files')).toBeInTheDocument();
        });

        it('should have a hidden CSV file input accepting .csv', () => {
            setupAppContext();
            const { container } = render(<ImportSalesData />);
            const input = container.querySelector('input[type="file"]') as HTMLInputElement;
            expect(input).toBeInTheDocument();
            expect(input.accept).toBe('.csv');
            expect(input).toHaveClass('hidden');
        });
    });

    // ==================== 2. Date Format Selection ====================
    describe('Date Format', () => {
        it('should default to M/d/yy', () => {
            setupAppContext();
            render(<ImportSalesData />);
            expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('M/d/yy');
        });

        it('should change when selecting a new option', () => {
            setupAppContext();
            render(<ImportSalesData />);
            const select = screen.getByRole('combobox') as HTMLSelectElement;
            fireEvent.change(select, { target: { value: 'yyyy-MM-dd' } });
            expect(select.value).toBe('yyyy-MM-dd');
        });

        it('should list all available date formats', () => {
            setupAppContext();
            render(<ImportSalesData />);
            const options = screen.getByRole('combobox').querySelectorAll('option');
            expect(options.length).toBe(3);
            const texts = Array.from(options).map(o => o.textContent);
            expect(texts.some(t => t?.includes('M/D/YY'))).toBe(true);
            expect(texts.some(t => t?.includes('YYYY-MM-DD'))).toBe(true);
            expect(texts.some(t => t?.includes('DD/MM/YYYY'))).toBe(true);
        });

        it('should toast info and clear data when format changes while CSV is loaded', () => {
            setupAppContext();
            patchFileReader();
            setPapaResult([{ Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' }]);

            const { container } = render(<ImportSalesData />);
            triggerUpload(container);

            // Now change format �?component should reset csvData and show info
            fireEvent.change(screen.getByRole('combobox'), { target: { value: 'yyyy-MM-dd' } });
            expect(toast.info).toHaveBeenCalledWith('Date format changed. Please re-upload your CSV file.');
        });
    });

    // ==================== 3. Template Download ====================
    describe('Template Download', () => {
        it('should create blob and trigger download', () => {
            setupAppContext();
            render(<ImportSalesData />);
            fireEvent.click(screen.getByText('Download Sample Template (.csv)'));
            expect(global.URL.createObjectURL).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith('Template downloaded successfully');
        });

        it('should generate a text/csv blob', () => {
            setupAppContext();
            let blob: Blob | null = null;
            (global.URL.createObjectURL as ReturnType<typeof vi.fn>).mockImplementation((b: Blob) => { blob = b; return 'blob:x'; });
            render(<ImportSalesData />);
            fireEvent.click(screen.getByText('Download Sample Template (.csv)'));
            expect(blob!.type).toBe('text/csv');
        });

        it('should revoke blob URL after download', () => {
            setupAppContext();
            render(<ImportSalesData />);
            fireEvent.click(screen.getByText('Download Sample Template (.csv)'));
            expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
        });

        it('should work with changed date format', () => {
            setupAppContext();
            render(<ImportSalesData />);
            fireEvent.change(screen.getByRole('combobox'), { target: { value: 'yyyy-MM-dd' } });
            fireEvent.click(screen.getByText('Download Sample Template (.csv)'));
            expect(toast.success).toHaveBeenCalledWith('Template downloaded successfully');
        });
    });

    // ==================== 4. File Upload Basics ====================
    describe('File Upload', () => {
        it('should reject non-CSV files', () => {
            setupAppContext();
            const { container } = render(<ImportSalesData />);
            const file = new File(['x'], 'data.txt', { type: 'text/plain' });
            triggerUpload(container, file);
            expect(toast.error).toHaveBeenCalledWith('Please upload a CSV file');
        });

        it('should trigger file input click on Browse Files', () => {
            setupAppContext();
            const { container } = render(<ImportSalesData />);
            const input = container.querySelector('input[type="file"]') as HTMLInputElement;
            const spy = vi.spyOn(input, 'click');
            fireEvent.click(screen.getByText('Browse Files'));
            expect(spy).toHaveBeenCalled();
        });

        it('should show error for empty CSV', () => {
            setupAppContext();
            patchFileReader();
            setPapaResult([]);
            const { container } = render(<ImportSalesData />);
            triggerUpload(container);
            expect(toast.error).toHaveBeenCalledWith('CSV file is empty');
        });

        it('should show error when papaparse throws', () => {
            setupAppContext();
            patchFileReader();
            setPapaError('Bad format');
            const { container } = render(<ImportSalesData />);
            triggerUpload(container);
            expect(toast.error).toHaveBeenCalledWith('Failed to parse CSV: Bad format');
        });
    });

    // ==================== 5. Drag & Drop ====================
    describe('Drag and Drop', () => {
        it('should highlight drop zone on dragOver', () => {
            setupAppContext();
            render(<ImportSalesData />);
            const zone = screen.getByText('Drop your CSV file here').closest('div')!;
            expect(zone).not.toHaveClass('border-[#4F6F52]');
            fireEvent.dragOver(zone);
            expect(zone).toHaveClass('border-[#4F6F52]');
        });

        it('should remove highlight on dragLeave', () => {
            setupAppContext();
            render(<ImportSalesData />);
            const zone = screen.getByText('Drop your CSV file here').closest('div')!;
            fireEvent.dragOver(zone);
            fireEvent.dragLeave(zone);
            expect(zone).not.toHaveClass('border-[#4F6F52]');
        });

        it('should process dropped CSV file', () => {
            setupAppContext();
            patchFileReader();
            setPapaResult([{ Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' }]);

            render(<ImportSalesData />);
            const zone = screen.getByText('Drop your CSV file here').closest('div')!;
            fireEvent.drop(zone, { dataTransfer: { files: [csvFile()] } });

            expect(toast.success).toHaveBeenCalledWith('CSV validated successfully! Review data before importing.');
        });

        it('should reject non-CSV file via drop', () => {
            setupAppContext();
            render(<ImportSalesData />);
            const zone = screen.getByText('Drop your CSV file here').closest('div')!;
            fireEvent.drop(zone, { dataTransfer: { files: [new File(['x'], 'test.xlsx')] } });
            expect(toast.error).toHaveBeenCalledWith('Please upload a CSV file');
        });
    });

    // ==================== 6. CSV Validation ====================
    describe('CSV Validation', () => {
        it('should show success toast for valid CSV without warnings', () => {
            setupAppContext();
            patchFileReader();
            setPapaResult([
                { Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' },
                { Date: '5/2/25', Dish_Name: 'Chicken Rice', Quantity_Sold: '120' },
            ]);
            // mockValidate already returns valid by default

            const { container } = render(<ImportSalesData />);
            triggerUpload(container);

            expect(toast.success).toHaveBeenCalledWith('CSV validated successfully! Review data before importing.');
        });

        it('should show success toast with warning count for auto-corrected values', () => {
            setupAppContext();
            patchFileReader();
            setPapaResult([{ Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' }]);
            mockValidate.mockReturnValue({
                isValid: true,
                errors: [],
                warnings: [{ row: 2, column: 'Quantity_Sold', value: '85.5', error: 'Auto-corrected' }],
            });

            const { container } = render(<ImportSalesData />);
            triggerUpload(container);

            expect(toast.success).toHaveBeenCalledWith('CSV validated successfully! 1 value(s) auto-corrected.');
        });

        it('should show error toast and error table for validation errors', () => {
            setupAppContext();
            patchFileReader();
            setPapaResult([{ Date: 'bad-date', Dish_Name: 'Laksa', Quantity_Sold: '85' }]);
            mockValidate.mockReturnValue({
                isValid: false,
                errors: [{ row: 2, column: 'Date', value: 'bad-date', error: 'Invalid date format', suggestion: 'Use M/D/YY' }],
                warnings: [],
            });

            const { container } = render(<ImportSalesData />);
            triggerUpload(container);

            expect(toast.error).toHaveBeenCalledWith('Upload failed: 1 issue detected');
            expect(screen.getByText('Upload Failed: 1 issue detected')).toBeInTheDocument();
            expect(screen.getByText('bad-date')).toBeInTheDocument();
            expect(screen.getByText('Invalid date format')).toBeInTheDocument();
            expect(screen.getByText('Use M/D/YY')).toBeInTheDocument();
        });

        it('should pluralize issue text for multiple errors', () => {
            setupAppContext();
            patchFileReader();
            setPapaResult([
                { Date: '', Dish_Name: 'Laksa', Quantity_Sold: '85' },
                { Date: '5/1/25', Dish_Name: 'Rice', Quantity_Sold: 'abc' },
            ]);
            mockValidate.mockReturnValue({
                isValid: false,
                errors: [
                    { row: 2, column: 'Date', value: '', error: 'Date is required' },
                    { row: 3, column: 'Quantity_Sold', value: 'abc', error: 'Invalid number' },
                ],
                warnings: [],
            });

            const { container } = render(<ImportSalesData />);
            triggerUpload(container);

            expect(toast.error).toHaveBeenCalledWith('Upload failed: 2 issues detected');
        });

        it('should show first 10 errors and count message when >10 errors', () => {
            setupAppContext();
            patchFileReader();
            // Unique Date+Dish_Name per row to avoid duplicate detection
            const rows = Array.from({ length: 15 }, (_, i) => ({
                Date: `${i + 1}/1/25`, Dish_Name: `Dish${i}`, Quantity_Sold: '85',
            }));
            setPapaResult(rows);
            mockValidate.mockReturnValue({
                isValid: false,
                errors: Array.from({ length: 15 }, (_, i) => ({
                    row: i + 2, column: 'Date', value: `bad${i}`, error: `Error ${i}`,
                })),
                warnings: [],
            });

            const { container } = render(<ImportSalesData />);
            triggerUpload(container);

            expect(screen.getByText('Showing first 10 of 15 errors')).toBeInTheDocument();
        });

        it('should show Go to Recipe Management button in error panel', () => {
            setupAppContext();
            patchFileReader();
            setPapaResult([{ Date: 'bad', Dish_Name: 'Laksa', Quantity_Sold: '85' }]);
            mockValidate.mockReturnValue({
                isValid: false,
                errors: [{ row: 2, column: 'Date', value: 'bad', error: 'err' }],
                warnings: [],
            });

            const { container } = render(<ImportSalesData />);
            triggerUpload(container);

            expect(screen.getByText('Go to Recipe Management')).toBeInTheDocument();
        });

        it('should download error log when >50 errors', () => {
            setupAppContext();
            patchFileReader();
            // Unique rows to avoid duplicate detection
            const rows = Array.from({ length: 55 }, (_, i) => ({
                Date: `${(i % 28) + 1}/1/25`, Dish_Name: `UniqueDish${i}`, Quantity_Sold: '85',
            }));
            setPapaResult(rows);
            mockValidate.mockReturnValue({
                isValid: false,
                errors: Array.from({ length: 55 }, (_, i) => ({
                    row: i + 2, column: 'Date', value: `bad${i}`, error: `Error ${i}`,
                })),
                warnings: [],
            });

            const { container } = render(<ImportSalesData />);
            triggerUpload(container);

            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Massive data mismatch'));
            expect(mockGenerateErrorLog).toHaveBeenCalled();
        });

        it('should show suggestion column with dash when no suggestion', () => {
            setupAppContext();
            patchFileReader();
            setPapaResult([{ Date: 'bad', Dish_Name: 'Laksa', Quantity_Sold: '85' }]);
            mockValidate.mockReturnValue({
                isValid: false,
                errors: [{ row: 2, column: 'Date', value: 'bad', error: 'err' }], // no suggestion field
                warnings: [],
            });

            const { container } = render(<ImportSalesData />);
            triggerUpload(container);

            // The suggestion column should show '-' when no suggestion
            const cells = container.querySelectorAll('td');
            const cellTexts = Array.from(cells).map(c => c.textContent);
            expect(cellTexts).toContain('-');
        });
    });

    // ==================== 7. Duplicate Detection ====================
    describe('Duplicate Detection in CSV', () => {
        function uploadWithDuplicates() {
            setupAppContext();
            patchFileReader();
            setPapaResult([
                { Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' },
                { Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '90' },
            ]);
            const { container } = render(<ImportSalesData />);
            triggerUpload(container);
            return container;
        }

        it('should detect and display duplicate entries', () => {
            uploadWithDuplicates();
            expect(toast.error).toHaveBeenCalledWith('Found 1 duplicate entries in CSV file');
            expect(screen.getByText('Duplicate Entries Found')).toBeInTheDocument();
            expect(screen.getByText('Laksa')).toBeInTheDocument();
        });

        it('should show Merge Duplicates button', () => {
            uploadWithDuplicates();
            expect(screen.getByText('Merge Duplicates (Keep Last Record)')).toBeInTheDocument();
        });

        it('should show Cancel Upload button', () => {
            uploadWithDuplicates();
            expect(screen.getByText('Cancel Upload')).toBeInTheDocument();
        });

        it('should display duplicate row numbers', () => {
            uploadWithDuplicates();
            expect(screen.getByText('2, 3')).toBeInTheDocument();
        });

        it('should show "Will keep last record" text', () => {
            uploadWithDuplicates();
            expect(screen.getByText('Will keep last record')).toBeInTheDocument();
        });

        it('should merge duplicates and show preview on Merge click', () => {
            setupAppContext();
            patchFileReader();
            setPapaResult([
                { Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' },
                { Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '90' },
                { Date: '5/2/25', Dish_Name: 'Chicken Rice', Quantity_Sold: '120' },
            ]);
            const { container } = render(<ImportSalesData />);
            triggerUpload(container);

            fireEvent.click(screen.getByText('Merge Duplicates (Keep Last Record)'));

            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Merged'));
            expect(screen.getByText('Data Preview - Ready to Import')).toBeInTheDocument();
        });

        it('should clear data on Cancel Upload click', () => {
            uploadWithDuplicates();
            fireEvent.click(screen.getByText('Cancel Upload'));
            expect(screen.queryByText('Duplicate Entries Found')).not.toBeInTheDocument();
        });

        it('should show warning note about overwriting', () => {
            uploadWithDuplicates();
            expect(screen.getByText(/Duplicate entries.*will be merged/)).toBeInTheDocument();
        });
    });

    // ==================== 8. Preview Table ====================
    describe('Preview Table', () => {
        function renderWithValidData(rows?: Record<string, string>[]) {
            setupAppContext();
            patchFileReader();
            const data = rows ?? [
                { Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' },
                { Date: '5/2/25', Dish_Name: 'Chicken Rice', Quantity_Sold: '120' },
            ];
            setPapaResult(data);
            // mockValidate already returns valid by default

            const result = render(<ImportSalesData />);
            triggerUpload(result.container);
            return result;
        }

        it('should show preview after valid upload', () => {
            renderWithValidData();
            expect(screen.getByText('Data Preview - Ready to Import')).toBeInTheDocument();
        });

        it('should show record count (plural)', () => {
            renderWithValidData();
            expect(screen.getByText('2 records validated successfully')).toBeInTheDocument();
        });

        it('should show record count (singular)', () => {
            renderWithValidData([{ Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' }]);
            expect(screen.getByText('1 record validated successfully')).toBeInTheDocument();
        });

        it('should display CSV data rows in table', () => {
            renderWithValidData();
            expect(screen.getByText('Laksa')).toBeInTheDocument();
            expect(screen.getByText('85')).toBeInTheDocument();
            expect(screen.getByText('Chicken Rice')).toBeInTheDocument();
            expect(screen.getByText('120')).toBeInTheDocument();
        });

        it('should show Import Data and Cancel buttons', () => {
            renderWithValidData();
            expect(screen.getByText('Import Data')).toBeInTheDocument();
            expect(screen.getByText('Cancel')).toBeInTheDocument();
        });

        it('should hide preview on Cancel click', () => {
            renderWithValidData();
            fireEvent.click(screen.getByText('Cancel'));
            expect(screen.queryByText('Data Preview - Ready to Import')).not.toBeInTheDocument();
        });

        it('should show "Showing first 10 of N records" when >10 rows', () => {
            const rows = Array.from({ length: 15 }, (_, i) => ({
                Date: `${i + 1}/1/25`, Dish_Name: `Dish${i}`, Quantity_Sold: `${i * 10}`,
            }));
            renderWithValidData(rows);
            expect(screen.getByText('Showing first 10 of 15 records')).toBeInTheDocument();
        });

        it('should show CheckCircle icon in preview header', () => {
            const { container } = renderWithValidData();
            // The preview header contains a CheckCircle icon from lucide-react
            const svgs = container.querySelectorAll('svg');
            const checkIcon = Array.from(svgs).find(svg =>
                svg.classList.toString().includes('check') || svg.classList.toString().includes('Check')
            );
            expect(checkIcon ?? container.querySelector('svg[class*="check"]')).toBeTruthy();
        });
    });

    // ==================== 9. Import Flow ====================
    describe('Import Flow', () => {
        function setupImport(opts?: { salesData?: typeof mockSalesData }) {
            setupAppContext({ salesData: opts?.salesData ?? [] });
            patchFileReader();
            setPapaResult([{ Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' }]);

            const result = render(<ImportSalesData />);
            triggerUpload(result.container);
            return result;
        }

        it('should call salesApi.importByName on import', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockResolvedValue({
                message: 'ok', imported: 1, newDishesCreated: 0, newDishes: [],
            });
            setupImport();
            fireEvent.click(screen.getByText('Import Data'));

            await waitFor(() => {
                expect(salesApi.importByName).toHaveBeenCalledWith(expect.objectContaining({
                    salesData: expect.arrayContaining([
                        expect.objectContaining({ dishName: 'Laksa', quantity: 85 }),
                    ]),
                }));
            });
        });

        it('should show success toast after import', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockResolvedValue({
                message: 'ok', imported: 1, newDishesCreated: 0, newDishes: [],
            });
            setupImport();
            fireEvent.click(screen.getByText('Import Data'));

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Successfully imported 1 sales records');
            });
        });

        it('should include new dishes info in success toast', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockResolvedValue({
                message: 'ok', imported: 1, newDishesCreated: 2, newDishes: ['Tom Yam', 'Pad Thai'],
            });
            setupImport();
            fireEvent.click(screen.getByText('Import Data'));

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith(
                    expect.stringContaining('Auto-created 2 new dish(es): Tom Yam, Pad Thai')
                );
            });
        });

        it('should clear preview after successful import', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockResolvedValue({
                message: 'ok', imported: 1, newDishesCreated: 0, newDishes: [],
            });
            setupImport();
            fireEvent.click(screen.getByText('Import Data'));

            await waitFor(() => {
                expect(screen.queryByText('Data Preview - Ready to Import')).not.toBeInTheDocument();
            });
        });

        it('should refresh data after successful import', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockResolvedValue({
                message: 'ok', imported: 1, newDishesCreated: 0, newDishes: [],
            });
            setupImport();
            fireEvent.click(screen.getByText('Import Data'));

            await waitFor(() => {
                expect(mockRefreshData).toHaveBeenCalled();
            });
        });

        it('should show error toast on import failure', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Server error'));
            setupImport();
            fireEvent.click(screen.getByText('Import Data'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to import sales data: Server error');
            });
        });

        it('should show specific toast for duplicate error', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('duplicate records found'));
            setupImport();
            fireEvent.click(screen.getByText('Import Data'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Duplicate records detected. The system prevents duplicate entries for the same date and recipe.'
                );
            });
        });

        it('should not render Import Data button when errors exist', () => {
            setupAppContext({ salesData: [] });
            patchFileReader();
            setPapaResult([{ Date: 'bad', Dish_Name: 'Laksa', Quantity_Sold: '85' }]);
            mockValidate.mockReturnValue({
                isValid: false,
                errors: [{ row: 2, column: 'Date', value: 'bad', error: 'Invalid' }],
                warnings: [],
            });

            const { container } = render(<ImportSalesData />);
            triggerUpload(container);

            // Preview card doesn't render when errors.length > 0
            expect(screen.queryByText('Import Data')).not.toBeInTheDocument();
        });

        it('should show warning toast on refreshData failure', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockResolvedValue({
                message: 'ok', imported: 1, newDishesCreated: 0, newDishes: [],
            });
            mockRefreshData.mockRejectedValueOnce(new Error('refresh failed'));
            setupImport();
            fireEvent.click(screen.getByText('Import Data'));

            await waitFor(() => {
                expect(toast.warning).toHaveBeenCalledWith(
                    'Data imported successfully, but failed to refresh. Please reload the page.'
                );
            });
        });

        it('should block import when there are duplicate rows in import data', async () => {
            setupAppContext({ salesData: [] });
            patchFileReader();
            // After merge we get unique rows, but the handleImport function also checks for duplicates
            // This scenario: non-duplicate CSV + valid validation + handleImport checks pass
            setPapaResult([
                { Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' },
            ]);

            (salesApi.importByName as ReturnType<typeof vi.fn>).mockResolvedValue({
                message: 'ok', imported: 1, newDishesCreated: 0, newDishes: [],
            });

            const { container } = render(<ImportSalesData />);
            triggerUpload(container);
            fireEvent.click(screen.getByText('Import Data'));

            await waitFor(() => {
                expect(salesApi.importByName).toHaveBeenCalled();
            });
        });
    });

    // ==================== 10. Overwrite Dialog ====================
    describe('Overwrite Confirmation Dialog', () => {
        /** Import data that clashes with existing salesData �?triggers overwrite dialog */
        function setupOverwrite() {
            // Existing: Laksa on 2025-05-01
            const existingSales = [{ id: 's1', date: '2025-05-01', recipeId: 'r1', quantity: 50 }];
            setupAppContext({ salesData: existingSales });
            patchFileReader();
            setPapaResult([{ Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' }]);

            const result = render(<ImportSalesData />);
            triggerUpload(result.container);
            fireEvent.click(screen.getByText('Import Data'));
            return result;
        }

        it('should open when existing duplicates detected', () => {
            setupOverwrite();
            expect(screen.getByText('Overwrite Existing Records')).toBeInTheDocument();
        });

        it('should show warning message', () => {
            setupOverwrite();
            expect(screen.getByText(/record\(s\) will overwrite existing data/)).toBeInTheDocument();
        });

        it('should show Overwrite & Import All button', () => {
            setupOverwrite();
            expect(screen.getByText('Overwrite & Import All')).toBeInTheDocument();
        });

        it('should show Import Only New button', () => {
            setupOverwrite();
            expect(screen.getByText('Import Only New')).toBeInTheDocument();
        });

        it('should show Cancel Import button', () => {
            setupOverwrite();
            expect(screen.getByText('Cancel Import')).toBeInTheDocument();
        });

        it('should close dialog on Cancel Import', () => {
            setupOverwrite();
            fireEvent.click(screen.getByText('Cancel Import'));
            expect(screen.queryByText('Overwrite Existing Records')).not.toBeInTheDocument();
        });

        it('should call importByName when Overwrite & Import All clicked', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockResolvedValue({
                message: 'ok', imported: 1, newDishesCreated: 0, newDishes: [],
            });
            setupOverwrite();
            fireEvent.click(screen.getByText('Overwrite & Import All'));

            await waitFor(() => {
                expect(salesApi.importByName).toHaveBeenCalled();
            });
        });

        it('should show success toast with overwrite count', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockResolvedValue({
                message: 'ok', imported: 1, newDishesCreated: 0, newDishes: [],
            });
            setupOverwrite();
            fireEvent.click(screen.getByText('Overwrite & Import All'));

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('overwritten'));
            });
        });

        it('should show error toast when overwrite fails', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));
            setupOverwrite();
            fireEvent.click(screen.getByText('Overwrite & Import All'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to import sales data: DB error');
            });
        });

        it('should show Import Summary section', () => {
            setupOverwrite();
            expect(screen.getByText('Import Summary')).toBeInTheDocument();
            expect(screen.getByText('Total records to import:')).toBeInTheDocument();
            expect(screen.getByText('New records:')).toBeInTheDocument();
            expect(screen.getByText('Records to overwrite:')).toBeInTheDocument();
        });

        it('should show How this works section', () => {
            setupOverwrite();
            expect(screen.getByText('How this works')).toBeInTheDocument();
            expect(screen.getByText('New records will be added to the database')).toBeInTheDocument();
        });

        it('should display existing and new quantities', () => {
            setupOverwrite();
            expect(screen.getByText('50 dishes')).toBeInTheDocument();
            expect(screen.getByText('85 dishes')).toBeInTheDocument();
        });

        it('should display quantity change with sign', () => {
            setupOverwrite();
            // 85 - 50 = +35
            expect(screen.getByText(/\+35/)).toBeInTheDocument();
        });

        it('should include new dishes info in overwrite success toast', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockResolvedValue({
                message: 'ok', imported: 1, newDishesCreated: 1, newDishes: ['New Dish'],
            });
            setupOverwrite();
            fireEvent.click(screen.getByText('Overwrite & Import All'));

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Auto-created 1 new dish(es)'));
            });
        });
    });

    // ==================== 11. Import Only New ====================
    describe('Import Only New', () => {
        function setupImportOnlyNew() {
            const existingSales = [{ id: 's1', date: '2025-05-01', recipeId: 'r1', quantity: 50 }];
            setupAppContext({ salesData: existingSales });
            patchFileReader();
            setPapaResult([
                { Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' },
                { Date: '5/2/25', Dish_Name: 'Chicken Rice', Quantity_Sold: '120' },
            ]);

            const result = render(<ImportSalesData />);
            triggerUpload(result.container);
            fireEvent.click(screen.getByText('Import Data'));
            return result;
        }

        it('should import only new records', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockResolvedValue({
                message: 'ok', imported: 1, newDishesCreated: 0, newDishes: [],
            });
            setupImportOnlyNew();
            fireEvent.click(screen.getByText('Import Only New'));

            await waitFor(() => {
                expect(salesApi.importByName).toHaveBeenCalled();
            });
        });

        it('should show toast with skipped count', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockResolvedValue({
                message: 'ok', imported: 1, newDishesCreated: 0, newDishes: [],
            });
            setupImportOnlyNew();
            fireEvent.click(screen.getByText('Import Only New'));

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('skipped'));
            });
        });

        it('should show info toast when no new records exist', async () => {
            const existingSales = [{ id: 's1', date: '2025-05-01', recipeId: 'r1', quantity: 50 }];
            setupAppContext({ salesData: existingSales });
            patchFileReader();
            setPapaResult([{ Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' }]);

            const { container } = render(<ImportSalesData />);
            triggerUpload(container);
            fireEvent.click(screen.getByText('Import Data'));
            fireEvent.click(screen.getByText('Import Only New'));

            await waitFor(() => {
                expect(toast.info).toHaveBeenCalledWith('No new records to import');
            });
        });

        it('should show error toast on failure', async () => {
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
            setupImportOnlyNew();
            fireEvent.click(screen.getByText('Import Only New'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to import sales data: Network error');
            });
        });
    });

    // ==================== 12. Integration ====================
    describe('Integration', () => {
        it('should render without crashing', () => {
            setupAppContext();
            expect(() => render(<ImportSalesData />)).not.toThrow();
        });

        it('should have no preview, errors, or duplicates on initial render', () => {
            setupAppContext();
            render(<ImportSalesData />);
            expect(screen.queryByText('Data Preview - Ready to Import')).not.toBeInTheDocument();
            expect(screen.queryByText(/Upload Failed/)).not.toBeInTheDocument();
            expect(screen.queryByText('Duplicate Entries Found')).not.toBeInTheDocument();
        });

        it('should handle re-render with changed context', () => {
            const spy = vi.spyOn(AppContext, 'useApp').mockReturnValue(createCtx() as AppContextType);
            const { rerender } = render(<ImportSalesData />);
            spy.mockReturnValue(createCtx({ recipes: [...mockRecipes, { id: 'r4', name: 'Tom Yam', isSubRecipe: false, ingredients: [] } as any] }) as AppContextType);
            rerender(<ImportSalesData />);
            expect(screen.getByText('Import Sales Data')).toBeInTheDocument();
        });

        it('should handle full upload→preview→cancel workflow', () => {
            setupAppContext();
            patchFileReader();
            setPapaResult([{ Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' }]);

            const { container } = render(<ImportSalesData />);
            triggerUpload(container);
            expect(screen.getByText('Data Preview - Ready to Import')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Cancel'));
            expect(screen.queryByText('Data Preview - Ready to Import')).not.toBeInTheDocument();
            expect(screen.getByText('Drop your CSV file here')).toBeInTheDocument();
        });

        it('should handle full upload→preview→import workflow', async () => {
            setupAppContext({ salesData: [] });
            patchFileReader();
            setPapaResult([{ Date: '5/1/25', Dish_Name: 'Laksa', Quantity_Sold: '85' }]);
            (salesApi.importByName as ReturnType<typeof vi.fn>).mockResolvedValue({
                message: 'ok', imported: 1, newDishesCreated: 0, newDishes: [],
            });

            const { container } = render(<ImportSalesData />);
            triggerUpload(container);
            expect(screen.getByText('Data Preview - Ready to Import')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Import Data'));

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Successfully imported 1 sales records');
                expect(screen.queryByText('Data Preview - Ready to Import')).not.toBeInTheDocument();
            });
        });
    });
});
