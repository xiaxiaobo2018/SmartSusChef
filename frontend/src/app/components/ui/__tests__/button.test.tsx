import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Button } from '../button';

describe('Button', () => {
    it('should render default button with data-slot', () => {
        const { container } = render(<Button>Click Me</Button>);

        const button = container.querySelector('[data-slot="button"]');
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('bg-primary');
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('should apply variant and size classes', () => {
        const { container } = render(
            <Button variant="outline" size="icon">
                Icon
            </Button>
        );

        const button = container.querySelector('button');
        expect(button).toHaveClass('border-2');
        expect(button).toHaveClass('size-9');
    });

    it('should render as child when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        );

        const link = screen.getByText('Link Button');
        expect(link.tagName.toLowerCase()).toBe('a');
        expect(link).toHaveAttribute('href', '/test');
    });

    it('should respect disabled prop', async () => {
        const user = userEvent.setup();
        render(<Button disabled>Disabled</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();

        await user.click(button);
        expect(button).toBeDisabled();
    });
});
