import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '../popover';

describe('Popover', () => {
    it('should render trigger with data-slot', () => {
        const { container } = render(
            <Popover>
                <PopoverTrigger asChild>
                    <button type="button">Open</button>
                </PopoverTrigger>
                <PopoverContent>Popover content</PopoverContent>
            </Popover>
        );

        expect(container.querySelector('[data-slot="popover-trigger"]')).toBeInTheDocument();
    });

    it('should open and render content on click', async () => {
        const user = userEvent.setup();
        render(
            <Popover>
                <PopoverTrigger asChild>
                    <button type="button">Open</button>
                </PopoverTrigger>
                <PopoverContent>Popover content</PopoverContent>
            </Popover>
        );

        await user.click(screen.getByText('Open'));

        await waitFor(() => {
            const content = document.querySelector('[data-slot="popover-content"]');
            expect(content).toBeInTheDocument();
            expect(content).toHaveTextContent('Popover content');
        });
    });
});
