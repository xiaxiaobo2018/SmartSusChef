import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { WastageManagement } from '../WastageManagement';
import * as AppContext from '@/app/context/AppContext';
import type { AppContextType } from '@/app/types';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

vi.mock('@/app/utils/recipeCalculations', () => ({
    getRecipeUnit: vi.fn(() => 'kg'),
    calculateRecipeCarbon: vi.fn(() => 2),
}));

vi.mock('@/app/utils/unitConversion', () => ({
    getStandardizedQuantity: vi.fn(() => 1),
}));

const mockIngredients = [
    { id: 'i1', name: 'Tomato', unit: 'kg', carbonFootprint: 1.5 },
    { id: 'i2', name: 'Rice', unit: 'g', carbonFootprint: 2.0 },
];

const mockRecipes = [
    { id: 'r1', name: 'Chicken Rice', isSubRecipe: false, ingredients: [] },
    { id: 'r2', name: 'Sauce', isSubRecipe: true, ingredients: [] },
];

const mockWastageData = [
    { id: 'w1', date: '2026-02-08', ingredientId: 'i1', quantity: 2.5, updatedAt: '2026-02-08T10:00:00Z' },
    { id: 'w2', date: '2026-02-09', recipeId: 'r1', quantity: 1.0, updatedAt: '2026-02-09T10:00:00Z' },
];

const mockUpdateWastage = vi.fn().mockResolvedValue(undefined);
const mockDeleteWastage = vi.fn().mockResolvedValue(undefined);
const mockAddWastage = vi.fn().mockResolvedValue(undefined);

function createCtx(overrides?: Partial<AppContextType>): Partial<AppContextType> {
    return {
        user: { id: 'u1', name: 'User' } as any,
        wastageData: mockWastageData,
        ingredients: mockIngredients,
        recipes: mockRecipes,
        updateWastageData: mockUpdateWastage,
        deleteWastageData: mockDeleteWastage,
        addWastageData: mockAddWastage,
        ...overrides,
    };
}

function useCtx(overrides?: Partial<AppContextType>) {
    vi.spyOn(AppContext, 'useApp').mockReturnValue(createCtx(overrides) as AppContextType);
}

describe('WastageManagement', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-02-09T00:00:00'));
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should render header, stats, and table rows', () => {
        useCtx();
        render(<WastageManagement />);

        expect(screen.getByText('Wastage Data Management')).toBeInTheDocument();
        expect(screen.getByText('Add New Record')).toBeInTheDocument();

        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3.5')).toBeInTheDocument();
        expect(screen.getByText('3.50')).toBeInTheDocument();

        expect(screen.getByText('Tomato')).toBeInTheDocument();
        expect(screen.getByText('Chicken Rice')).toBeInTheDocument();
    });

    it('should render empty state when no data', () => {
        useCtx({ wastageData: [] });
        render(<WastageManagement />);

        expect(screen.getByText('No wastage data available for this filter.')).toBeInTheDocument();
    });

    it('should open edit dialog for recent data', () => {
        useCtx();
        render(<WastageManagement />);

        const row = screen.getByText('Tomato').closest('tr')!;
        const editButton = within(row).getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);

        expect(screen.getByText('Edit Wastage Data')).toBeInTheDocument();
        expect(screen.getByText('Current Quantity')).toBeInTheDocument();
    });

    it('should block edit for data older than 7 days', () => {
        useCtx({
            wastageData: [
                { id: 'w-old', date: '2026-01-30', ingredientId: 'i1', quantity: 1.0 },
            ],
        });
        render(<WastageManagement />);

        const row = screen.getByText('Tomato').closest('tr')!;
        const editButton = within(row).getByRole('button', { name: /edit/i });
        expect(editButton).toBeDisabled();
    });

    it('should open create dialog and show disabled save button by default', () => {
        useCtx();
        render(<WastageManagement />);

        fireEvent.click(screen.getByText('Add New Record'));
        const saveButton = screen.getByRole('button', { name: 'Save Record' });
        expect(saveButton).toBeDisabled();
    });
});
