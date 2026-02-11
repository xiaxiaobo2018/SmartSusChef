import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

function TestComponent() {
    const isMobile = useIsMobile();
    return <div>{isMobile ? 'mobile' : 'desktop'}</div>;
}

describe('useIsMobile', () => {
    it('should detect mobile and desktop based on window width', async () => {
        let listener: ((event?: MediaQueryListEvent) => void) | null = null;
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: (query: string) => ({
                media: query,
                matches: window.innerWidth < 768,
                addEventListener: (_: string, cb: (event?: MediaQueryListEvent) => void) => {
                    listener = cb;
                },
                removeEventListener: () => {},
            }),
        });

        window.innerWidth = 500;
        render(<TestComponent />);

        await waitFor(() => {
            expect(screen.getByText('mobile')).toBeInTheDocument();
        });

        window.innerWidth = 1024;
        act(() => {
            listener?.();
        });

        await waitFor(() => {
            expect(screen.getByText('desktop')).toBeInTheDocument();
        });
    });
});
