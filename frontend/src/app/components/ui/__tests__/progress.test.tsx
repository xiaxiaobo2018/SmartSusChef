import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Progress } from '../progress';

describe('Progress', () => {
    it('should render progress with indicator', () => {
        const { container } = render(<Progress value={45} />);

        const root = container.querySelector('[data-slot="progress"]');
        const indicator = container.querySelector('[data-slot="progress-indicator"]');
        expect(root).toBeInTheDocument();
        expect(indicator).toBeInTheDocument();
        expect(indicator).toHaveStyle({ transform: 'translateX(-55%)' });
    });

    it('should default to 0 when value is undefined', () => {
        const { container } = render(<Progress />);

        const indicator = container.querySelector('[data-slot="progress-indicator"]');
        expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('should apply custom className', () => {
        const { container } = render(<Progress className="custom-progress" value={10} />);

        const root = container.querySelector('[data-slot="progress"]');
        expect(root).toHaveClass('custom-progress');
    });
});
