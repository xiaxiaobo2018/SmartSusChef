import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Separator } from '../separator';

describe('Separator', () => {
    it('should render horizontal separator by default', () => {
        const { container } = render(<Separator />);

        const separator = container.querySelector('[data-slot="separator-root"]');
        expect(separator).toBeInTheDocument();
        expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should render vertical separator', () => {
        const { container } = render(<Separator orientation="vertical" />);

        const separator = container.querySelector('[data-slot="separator-root"]');
        expect(separator).toHaveAttribute('data-orientation', 'vertical');
        expect(separator).toHaveClass('data-[orientation=vertical]:w-px');
    });

    it('should apply custom className', () => {
        const { container } = render(<Separator className="custom-separator" />);

        const separator = container.querySelector('[data-slot="separator-root"]');
        expect(separator).toHaveClass('custom-separator');
    });
});
