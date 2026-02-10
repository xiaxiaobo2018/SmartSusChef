import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../collapsible';

describe('Collapsible', () => {
    it('should toggle content', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <Collapsible>
                <CollapsibleTrigger>Toggle</CollapsibleTrigger>
                <CollapsibleContent>Content</CollapsibleContent>
            </Collapsible>
        );

        const content = container.querySelector('[data-slot="collapsible-content"]');
        expect(content).toHaveAttribute('data-state', 'closed');

        await user.click(screen.getByText('Toggle'));

        await waitFor(() => {
            expect(content).toHaveAttribute('data-state', 'open');
        });
    });
});
