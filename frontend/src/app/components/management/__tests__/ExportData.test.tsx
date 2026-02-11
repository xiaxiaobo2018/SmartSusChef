import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportData } from '../ExportData';
import * as AppContext from '@/app/context/AppContext';
import type { AppContextType } from '@/app/types';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ExportData', () => {
    const mockExportData = vi.fn();

    const createMockContext = (
        salesCount = 10,
        wastageCount = 5,
        forecastCount = 7
    ): Partial<AppContextType> => ({
        exportData: mockExportData,
        salesData: Array(salesCount).fill({ id: '1', date: '2026-02-09', recipeId: 'r1', quantity: 10 }),
        wastageData: Array(wastageCount).fill({ id: '1', date: '2026-02-09', ingredientId: 'i1', quantity: 2 }),
        forecastData: Array(forecastCount).fill({ date: '2026-02-10', recipeId: 'r1', quantity: 15 }),
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mockExportData.mockResolvedValue(undefined);

        // Suppress console errors in tests
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    // ==================== Rendering Tests ====================
    describe('Rendering', () => {
        it('should render page title and description', () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            expect(screen.getByText('Export Data')).toBeInTheDocument();
            expect(screen.getByText('Export raw data as CSV files')).toBeInTheDocument();
        });

        it('should render download icon in title', () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(<ExportData />);

            const downloadIcon = container.querySelector('svg.lucide-download');
            expect(downloadIcon).toBeInTheDocument();
        });

        it('should render three export cards', () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            expect(screen.getByText('Sales Data')).toBeInTheDocument();
            expect(screen.getByText('Wastage Data')).toBeInTheDocument();
            expect(screen.getByText('Forecast Data')).toBeInTheDocument();
        });

        it('should render card descriptions', () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            expect(screen.getByText('Export all sales records with dates and quantities')).toBeInTheDocument();
            expect(screen.getByText('Export wastage records with ingredient details')).toBeInTheDocument();
            expect(screen.getByText('Export predicted sales for upcoming days')).toBeInTheDocument();
        });

        it('should render export buttons for all data types', () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            expect(exportButtons).toHaveLength(3);
        });

        it('should render information card', () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            expect(screen.getByText('CSV Export Information')).toBeInTheDocument();
            expect(screen.getByText('File Format')).toBeInTheDocument();
            expect(screen.getByText('Data Contents')).toBeInTheDocument();
        });

        it('should display file format information', () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            expect(
                screen.getByText(/All data is exported in CSV \(Comma-Separated Values\) format/)
            ).toBeInTheDocument();
        });

        it('should display data contents for each type', () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            expect(screen.getByText(/Sales: Date, Recipe Name, Quantity Sold/)).toBeInTheDocument();
            expect(screen.getByText(/Wastage: Date, Ingredient Name, Quantity Wasted, Unit/)).toBeInTheDocument();
            expect(screen.getByText(/Forecast: Date, Recipe Name, Predicted Quantity/)).toBeInTheDocument();
        });
    });

    // ==================== Data Display Tests ====================
    describe('Data Display', () => {
        it('should display correct sales data count', () => {
            const mockContext = createMockContext(25, 5, 7);
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const salesCard = screen.getByText('Sales Data').closest('div')?.parentElement?.parentElement;
            expect(salesCard).toHaveTextContent('25');
            expect(salesCard).toHaveTextContent('records');
        });

        it('should display correct wastage data count', () => {
            const mockContext = createMockContext(10, 15, 7);
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const wastageCard = screen.getByText('Wastage Data').closest('div')?.parentElement?.parentElement;
            expect(wastageCard).toHaveTextContent('15');
        });

        it('should display correct forecast data count', () => {
            const mockContext = createMockContext(10, 5, 30);
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const forecastCard = screen.getByText('Forecast Data').closest('div')?.parentElement?.parentElement;
            expect(forecastCard).toHaveTextContent('30');
        });

        it('should display zero when no data', () => {
            const mockContext = createMockContext(0, 0, 0);
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const salesCard = screen.getByText('Sales Data').closest('div')?.parentElement?.parentElement;
            const wastageCard = screen.getByText('Wastage Data').closest('div')?.parentElement?.parentElement;
            const forecastCard = screen.getByText('Forecast Data').closest('div')?.parentElement?.parentElement;

            expect(salesCard).toHaveTextContent('0');
            expect(wastageCard).toHaveTextContent('0');
            expect(forecastCard).toHaveTextContent('0');
        });

        it('should handle large data counts', () => {
            const mockContext = createMockContext(1000, 500, 250);
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            expect(screen.getByText('1000')).toBeInTheDocument();
            expect(screen.getByText('500')).toBeInTheDocument();
            expect(screen.getByText('250')).toBeInTheDocument();
        });
    });

    // ==================== Export Functionality Tests ====================
    describe('Export Functionality', () => {
        it('should call exportData with "sales" when sales export button clicked', async () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const salesCard = screen.getByText('Sales Data').closest('div')?.parentElement?.parentElement;
            const exportButton = salesCard?.querySelector('button');

            fireEvent.click(exportButton!);

            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalledWith('sales');
            });
        });

        it('should call exportData with "wastage" when wastage export button clicked', async () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            fireEvent.click(exportButtons[1]); // Wastage

            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalledWith('wastage');
            });
        });

        it('should call exportData with "forecast" when forecast export button clicked', async () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            fireEvent.click(exportButtons[2]); // Forecast

            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalledWith('forecast');
            });
        });

        it('should show success toast after successful sales export', async () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            fireEvent.click(exportButtons[0]); // Sales

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Sales data exported as CSV successfully');
            });
        });

        it('should show success toast after successful wastage export', async () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            fireEvent.click(exportButtons[1]); // Wastage

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Wastage data exported as CSV successfully');
            });
        });

        it('should show success toast after successful forecast export', async () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            fireEvent.click(exportButtons[2]); // Forecast

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Forecast data exported as CSV successfully');
            });
        });

        it('should handle multiple sequential exports', async () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');

            // Export sales
            fireEvent.click(exportButtons[0]);
            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalledWith('sales');
            });

            // Export wastage
            fireEvent.click(exportButtons[1]);
            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalledWith('wastage');
            });

            expect(mockExportData).toHaveBeenCalledTimes(2);
        });
    });

    // ==================== Loading State Tests ====================
    describe('Loading State', () => {
        it('should disable button during export', async () => {
            let resolveExport: () => void;
            const exportPromise = new Promise<void>((resolve) => {
                resolveExport = resolve;
            });
            mockExportData.mockReturnValue(exportPromise);

            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            const salesButton = exportButtons[0];

            fireEvent.click(salesButton);

            // Button should be disabled during export
            await waitFor(() => {
                expect(salesButton).toBeDisabled();
            });

            // Resolve the export
            resolveExport!();

            // Button should be enabled again
            await waitFor(() => {
                expect(salesButton).not.toBeDisabled();
            });
        });

        it('should only disable the specific button being exported', async () => {
            let resolveExport: () => void;
            const exportPromise = new Promise<void>((resolve) => {
                resolveExport = resolve;
            });
            mockExportData.mockReturnValue(exportPromise);

            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            const salesButton = exportButtons[0];
            const wastageButton = exportButtons[1];
            const forecastButton = exportButtons[2];

            fireEvent.click(salesButton);

            await waitFor(() => {
                expect(salesButton).toBeDisabled();
                expect(wastageButton).not.toBeDisabled();
                expect(forecastButton).not.toBeDisabled();
            });

            resolveExport!();
        });

        it('should re-enable button after export completes', async () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            const salesButton = exportButtons[0];

            fireEvent.click(salesButton);

            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalled();
            });

            // Wait for loading to complete
            await waitFor(() => {
                expect(salesButton).not.toBeDisabled();
            });
        });

        it('should re-enable button even if export fails', async () => {
            // Mock console.error to suppress expected error output
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            mockExportData.mockRejectedValue(new Error('Export failed'));

            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            const salesButton = exportButtons[0];

            fireEvent.click(salesButton);

            // Button should re-enable after failure (catch + finally blocks)
            await waitFor(() => {
                expect(salesButton).not.toBeDisabled();
            });

            consoleErrorSpy.mockRestore();
        });
    });

    // ==================== Success Indicator Tests ====================
    describe('Success Indicator', () => {
        it('should show check icon after successful sales export', async () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            fireEvent.click(exportButtons[0]); // Sales

            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalled();
            });

            // Check icon should appear in sales card
            const checkIcon = container.querySelector('svg.lucide-circle-check');
            expect(checkIcon).toBeInTheDocument();
        });

        it('should show check icon after successful wastage export', async () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            fireEvent.click(exportButtons[1]); // Wastage

            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalled();
            });

            const checkIcon = container.querySelector('svg.lucide-circle-check');
            expect(checkIcon).toBeInTheDocument();
        });

        it('should show check icon after successful forecast export', async () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            fireEvent.click(exportButtons[2]); // Forecast

            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalled();
            });

            const checkIcon = container.querySelector('svg.lucide-circle-check');
            expect(checkIcon).toBeInTheDocument();
        });

        it('should update check icon when exporting different type', async () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');

            // Export sales first
            fireEvent.click(exportButtons[0]);
            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalledWith('sales');
            });

            // Export wastage second
            fireEvent.click(exportButtons[1]);
            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalledWith('wastage');
            });

            // Check icon should be present (only one at a time)
            const checkIcon = container.querySelector('svg.lucide-circle-check');
            expect(checkIcon).toBeInTheDocument();
        });

        it('should add border to card after successful export', async () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            fireEvent.click(exportButtons[0]);

            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalled();
            });

            // Should have border after export (check for Card component with border-2)
            const cardWithBorder = container.querySelector('[data-slot="card"].border-2');
            expect(cardWithBorder).toBeInTheDocument();
        });
    });

    // ==================== Edge Cases ====================
    describe('Edge Cases', () => {
        it('should handle export with empty sales data', async () => {
            const mockContext = createMockContext(0, 5, 7);
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            fireEvent.click(exportButtons[0]);

            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalledWith('sales');
                expect(toast.success).toHaveBeenCalled();
            });
        });

        it('should handle export with empty wastage data', async () => {
            const mockContext = createMockContext(10, 0, 7);
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            fireEvent.click(exportButtons[1]);

            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalledWith('wastage');
            });
        });

        it('should handle export with empty forecast data', async () => {
            const mockContext = createMockContext(10, 5, 0);
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            fireEvent.click(exportButtons[2]);

            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalledWith('forecast');
            });
        });

        it('should handle all data types being empty', async () => {
            const mockContext = createMockContext(0, 0, 0);
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            expect(screen.getByText('Sales Data')).toBeInTheDocument();
            expect(screen.getByText('Wastage Data')).toBeInTheDocument();
            expect(screen.getByText('Forecast Data')).toBeInTheDocument();
        });

        it('should not show check icon before any export', () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(<ExportData />);

            const checkIcons = container.querySelectorAll('svg.lucide-check-circle2');
            expect(checkIcons).toHaveLength(0);
        });

        it('should handle rapid consecutive clicks on same button', async () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            const salesButton = exportButtons[0];

            // Click multiple times rapidly
            fireEvent.click(salesButton);
            fireEvent.click(salesButton);
            fireEvent.click(salesButton);

            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalledTimes(1);
            });
        });
    });

    // ==================== Integration Tests ====================
    describe('Integration', () => {
        it('should render without crashing', () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            expect(() => {
                render(<ExportData />);
            }).not.toThrow();
        });

        it('should display all card icons', () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(<ExportData />);

            const fileIcons = container.querySelectorAll('svg.lucide-file-spreadsheet');
            expect(fileIcons).toHaveLength(3); // One for each export card
        });

        it('should have correct button styling', () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            exportButtons.forEach(button => {
                expect(button).toHaveClass('bg-[#4F6F52]');
            });
        });

        it('should display download icons in buttons', () => {
            const mockContext = createMockContext();
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            render(<ExportData />);

            const exportButtons = screen.getAllByText('Export as CSV');
            exportButtons.forEach(button => {
                const downloadIcon = button.querySelector('svg.lucide-download');
                expect(downloadIcon).toBeInTheDocument();
            });
        });

        it('should complete full export workflow', async () => {
            const mockContext = createMockContext(10, 5, 7);
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { container } = render(<ExportData />);

            // Verify initial state
            expect(screen.getByText('10')).toBeInTheDocument();

            // Click export
            const exportButtons = screen.getAllByText('Export as CSV');
            fireEvent.click(exportButtons[0]);

            // Verify export called
            await waitFor(() => {
                expect(mockExportData).toHaveBeenCalledWith('sales');
            });

            // Verify success feedback
            await waitFor(() => {
                expect(toast.success).toHaveBeenCalled();
            });

            // Verify check icon appears
            await waitFor(() => {
                const checkIcon = container.querySelector('svg.lucide-circle-check');
                expect(checkIcon).toBeInTheDocument();
            });
        });

        it('should handle props update correctly', () => {
            const mockContext = createMockContext(10, 5, 7);
            vi.spyOn(AppContext, 'useApp').mockReturnValue(mockContext as AppContextType);

            const { rerender } = render(<ExportData />);

            expect(screen.getByText('10')).toBeInTheDocument();

            // Update context with new data
            const updatedContext = createMockContext(20, 10, 14);
            vi.spyOn(AppContext, 'useApp').mockReturnValue(updatedContext as AppContextType);

            rerender(<ExportData />);

            expect(screen.getByText('20')).toBeInTheDocument();
            expect(screen.getByText('14')).toBeInTheDocument();
        });
    });
});
