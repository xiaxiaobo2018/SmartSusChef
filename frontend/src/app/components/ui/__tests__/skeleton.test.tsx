import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '../skeleton';

describe('Skeleton', () => {
    it('should render skeleton with data-slot', () => {
        const { container } = render(<Skeleton />);

        const skeleton = container.querySelector('[data-slot="skeleton"]');
        expect(skeleton).toBeInTheDocument();
        expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should apply custom className', () => {
        const { container } = render(<Skeleton className="custom-skeleton" />);

        const skeleton = container.querySelector('[data-slot="skeleton"]');
        expect(skeleton).toHaveClass('custom-skeleton');
    });
});
