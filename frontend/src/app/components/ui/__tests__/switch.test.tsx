import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '../switch';

describe('Switch', () => {
    it('should render switch with data-slot', () => {
        const { container } = render(<Switch />);

        const root = container.querySelector('[data-slot="switch"]');
        const thumb = container.querySelector('[data-slot="switch-thumb"]');
        expect(root).toBeInTheDocument();
        expect(thumb).toBeInTheDocument();
    });

    it('should toggle checked state on click', async () => {
        const user = userEvent.setup();
        render(<Switch />);

        const switchButton = screen.getByRole('switch');
        expect(switchButton).toHaveAttribute('aria-checked', 'false');

        await user.click(switchButton);
        expect(switchButton).toHaveAttribute('aria-checked', 'true');
    });

    it('should apply custom className', () => {
        const { container } = render(<Switch className="custom-switch" />);

        const root = container.querySelector('[data-slot="switch"]');
        expect(root).toHaveClass('custom-switch');
    });
});
