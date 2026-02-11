import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from '../alert-dialog';

describe('AlertDialog', () => {
    it('should render trigger with data-slot', () => {
        const { container } = render(
            <AlertDialog>
                <AlertDialogTrigger>Open</AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Title</AlertDialogTitle>
                        <AlertDialogDescription>Description</AlertDialogDescription>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
        );

        expect(container.querySelector('[data-slot="alert-dialog-trigger"]')).toBeInTheDocument();
    });

    it('should open and close alert dialog', async () => {
        const user = userEvent.setup();
        render(
            <AlertDialog>
                <AlertDialogTrigger>Open</AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );

        await user.click(screen.getByText('Open'));

        await waitFor(() => {
            expect(document.querySelector('[data-slot="alert-dialog-content"]')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Cancel'));

        await waitFor(() => {
            expect(document.querySelector('[data-slot="alert-dialog-content"]')).not.toBeInTheDocument();
        });
    });
});
