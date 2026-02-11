import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
    MenubarContent,
    MenubarItem,
    MenubarSeparator,
} from '../menubar';

describe('Menubar', () => {
    it('should open menu content on trigger click', async () => {
        const user = userEvent.setup();
        render(
            <Menubar>
                <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>New</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Open</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        );

        await user.click(screen.getByText('File'));

        await waitFor(() => {
            expect(document.querySelector('[data-slot="menubar-content"]')).toBeInTheDocument();
            expect(document.querySelector('[data-slot="menubar-item"]')).toBeInTheDocument();
            expect(document.querySelector('[data-slot="menubar-separator"]')).toBeInTheDocument();
        });
    });
});
