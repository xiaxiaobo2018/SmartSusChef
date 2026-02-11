import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../hover-card';

describe('HoverCard', () => {
    it('should render trigger with data-slot', () => {
        const { container } = render(
            <HoverCard>
                <HoverCardTrigger asChild>
                    <button type="button">Hover</button>
                </HoverCardTrigger>
                <HoverCardContent>Details</HoverCardContent>
            </HoverCard>
        );

        expect(container.querySelector('[data-slot="hover-card-trigger"]')).toBeInTheDocument();
    });

    it('should show content on hover', async () => {
        const user = userEvent.setup();
        render(
            <HoverCard>
                <HoverCardTrigger asChild>
                    <button type="button">Hover</button>
                </HoverCardTrigger>
                <HoverCardContent>Details</HoverCardContent>
            </HoverCard>
        );

        await user.hover(screen.getByText('Hover'));

        await waitFor(() => {
            const content = document.querySelector('[data-slot="hover-card-content"]');
            expect(content).toBeInTheDocument();
            expect(content).toHaveTextContent('Details');
        });
    });
});
