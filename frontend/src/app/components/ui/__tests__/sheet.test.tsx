import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from '../sheet';

describe('Sheet', () => {
    it('should open and close sheet', async () => {
        const user = userEvent.setup();
        render(
            <Sheet>
                <SheetTrigger>Open</SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Title</SheetTitle>
                        <SheetDescription>Description</SheetDescription>
                    </SheetHeader>
                    <SheetFooter>
                        <SheetClose>Close</SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        );

        await user.click(screen.getByText('Open'));

        await waitFor(() => {
            expect(document.querySelector('[data-slot="sheet-content"]')).toBeInTheDocument();
        });

        const closeButtons = screen.getAllByRole('button', { name: 'Close' });
        await user.click(closeButtons[0]);

        await waitFor(() => {
            expect(document.querySelector('[data-slot="sheet-content"]')).not.toBeInTheDocument();
        });
    });
});
