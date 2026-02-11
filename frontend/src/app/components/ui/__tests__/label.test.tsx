import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../label';
import { Input } from '../input';

describe('Label', () => {
    it('should render label with data-slot', () => {
        render(<Label>Username</Label>);

        const label = screen.getByText('Username');
        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute('data-slot', 'label');
    });

    it('should associate label with input using htmlFor', () => {
        render(
            <div>
                <Label htmlFor="user-input">User</Label>
                <Input id="user-input" />
            </div>
        );

        const input = screen.getByLabelText('User');
        expect(input).toBeInTheDocument();
    });

    it('should apply custom className', () => {
        const { container } = render(<Label className="custom-label">Label</Label>);

        const label = container.querySelector('[data-slot="label"]');
        expect(label).toHaveClass('custom-label');
        expect(label).toHaveClass('text-sm');
    });
});
