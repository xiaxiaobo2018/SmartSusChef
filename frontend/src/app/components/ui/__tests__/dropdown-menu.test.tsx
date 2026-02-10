import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from '../dropdown-menu';

describe('DropdownMenu', () => {
    it('should render trigger with data-slot', () => {
        const { container } = render(
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button type="button">Menu</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Item</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );

        expect(container.querySelector('[data-slot="dropdown-menu-trigger"]')).toBeInTheDocument();
    });

    it('should open content and render menu items', async () => {
        const user = userEvent.setup();
        render(
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button type="button">Menu</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                        Enable
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );

        await user.click(screen.getByText('Menu'));

        await waitFor(() => {
            expect(document.querySelector('[data-slot="dropdown-menu-content"]')).toBeInTheDocument();
            expect(document.querySelector('[data-slot="dropdown-menu-label"]')).toBeInTheDocument();
            expect(document.querySelector('[data-slot="dropdown-menu-separator"]')).toBeInTheDocument();
            expect(document.querySelector('[data-slot="dropdown-menu-checkbox-item"]')).toBeInTheDocument();
        });
    });
});
