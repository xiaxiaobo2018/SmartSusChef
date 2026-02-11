import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '../alert';

describe('Alert', () => {
    it('should render alert with title and description', () => {
        const { container } = render(
            <Alert>
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>Something happened</AlertDescription>
            </Alert>
        );

        expect(container.querySelector('[data-slot="alert"]')).toBeInTheDocument();
        expect(screen.getByText('Warning')).toBeInTheDocument();
        expect(screen.getByText('Something happened')).toBeInTheDocument();
    });

    it('should render destructive variant', () => {
        const { container } = render(
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
            </Alert>
        );

        const alert = container.querySelector('[data-slot="alert"]');
        expect(alert).toHaveClass('text-destructive');
    });
});
