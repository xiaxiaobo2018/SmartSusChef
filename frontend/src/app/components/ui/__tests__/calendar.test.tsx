import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Calendar } from '../calendar';

describe('Calendar', () => {
    it('should render calendar with day buttons', () => {
        render(
            <Calendar
                month={new Date(2024, 0, 1)}
                selected={new Date(2024, 0, 2)}
            />
        );

        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });
});
