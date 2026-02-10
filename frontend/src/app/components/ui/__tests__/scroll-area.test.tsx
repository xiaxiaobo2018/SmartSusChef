import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ScrollArea } from '../scroll-area';

describe('ScrollArea', () => {
    it('should render scroll area structure', () => {
        const { container } = render(
            <ScrollArea>
                <div>Scrollable</div>
            </ScrollArea>
        );

        expect(container.querySelector('[data-slot="scroll-area"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="scroll-area-viewport"]')).toBeInTheDocument();
        expect(screen.getByText('Scrollable')).toBeInTheDocument();
    });
});
