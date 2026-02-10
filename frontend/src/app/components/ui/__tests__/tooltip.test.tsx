import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../tooltip';

describe('Tooltip', () => {
    it('should render trigger with data-slot', () => {
        const { container } = render(
            <Tooltip>
                <TooltipTrigger asChild>
                    <button type="button">Help</button>
                </TooltipTrigger>
                <TooltipContent>Helpful text</TooltipContent>
            </Tooltip>
        );

        expect(container.querySelector('[data-slot="tooltip-trigger"]')).toBeInTheDocument();
    });

    it('should show tooltip content on hover', async () => {
        const user = userEvent.setup();
        render(
            <Tooltip>
                <TooltipTrigger asChild>
                    <button type="button">Info</button>
                </TooltipTrigger>
                <TooltipContent>Tooltip content</TooltipContent>
            </Tooltip>
        );

        await user.hover(screen.getByText('Info'));

        await waitFor(() => {
            const content = document.querySelector('[data-slot="tooltip-content"]');
            expect(content).toBeInTheDocument();
            expect(content).toHaveTextContent('Tooltip content');
        });
    });
});
