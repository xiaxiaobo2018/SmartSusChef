import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../checkbox';

describe('Checkbox', () => {
    it('should render checkbox root', () => {
        const { container } = render(<Checkbox />);

        const root = container.querySelector('[data-slot="checkbox"]');
        expect(root).toBeInTheDocument();
        expect(container.querySelector('[data-slot="checkbox-indicator"]')).not.toBeInTheDocument();
    });

    it('should toggle checked state on click', async () => {
        const user = userEvent.setup();
        render(<Checkbox />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveAttribute('aria-checked', 'false');

        await user.click(checkbox);
        expect(checkbox).toHaveAttribute('aria-checked', 'true');
        expect(document.querySelector('[data-slot="checkbox-indicator"]')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
        const { container } = render(<Checkbox className="custom-checkbox" />);

        const root = container.querySelector('[data-slot="checkbox"]');
        expect(root).toHaveClass('custom-checkbox');
    });
});
