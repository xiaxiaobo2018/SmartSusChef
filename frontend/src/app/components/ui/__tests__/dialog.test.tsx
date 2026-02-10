import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '../dialog';

describe('Dialog', () => {
    it('should render trigger with data-slot', () => {
        const { container } = render(
            <Dialog>
                <DialogTrigger>Open Dialog</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Title</DialogTitle>
                        <DialogDescription>Description</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );

        expect(container.querySelector('[data-slot="dialog-trigger"]')).toBeInTheDocument();
    });

    it('should open and close dialog', async () => {
        const user = userEvent.setup();
        render(
            <Dialog>
                <DialogTrigger>Open Dialog</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Title</DialogTitle>
                        <DialogDescription>Description</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose>Close</DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );

        await user.click(screen.getByText('Open Dialog'));

        await waitFor(() => {
            expect(document.querySelector('[data-slot="dialog-content"]')).toBeInTheDocument();
        });

        const closeButtons = screen.getAllByRole('button', { name: 'Close' });
        const closeButton = closeButtons.find((node) =>
            node.getAttribute('data-slot') === 'dialog-close'
        ) ?? closeButtons[0];

        await user.click(closeButton);

        await waitFor(() => {
            expect(document.querySelector('[data-slot="dialog-content"]')).not.toBeInTheDocument();
        });
    });
});
