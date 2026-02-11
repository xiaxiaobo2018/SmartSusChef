import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuCheckboxItem,
} from '../context-menu';

describe('ContextMenu', () => {
    it('should open context menu on right click', async () => {
        render(
            <ContextMenu>
                <ContextMenuTrigger>Target</ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem>Item</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuCheckboxItem checked>Enabled</ContextMenuCheckboxItem>
                </ContextMenuContent>
            </ContextMenu>
        );

        fireEvent.contextMenu(screen.getByText('Target'));

        await waitFor(() => {
            expect(document.querySelector('[data-slot="context-menu-content"]')).toBeInTheDocument();
            expect(document.querySelector('[data-slot="context-menu-item"]')).toBeInTheDocument();
            expect(document.querySelector('[data-slot="context-menu-separator"]')).toBeInTheDocument();
            expect(document.querySelector('[data-slot="context-menu-checkbox-item"]')).toBeInTheDocument();
        });
    });
});
