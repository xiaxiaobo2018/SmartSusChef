import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AspectRatio } from '../aspect-ratio';

describe('AspectRatio', () => {
    it('should render children and data-slot', () => {
        const { container } = render(
            <AspectRatio ratio={16 / 9}>
                <div>Content</div>
            </AspectRatio>
        );

        expect(container.querySelector('[data-slot="aspect-ratio"]')).toBeInTheDocument();
        expect(screen.getByText('Content')).toBeInTheDocument();
    });
});
