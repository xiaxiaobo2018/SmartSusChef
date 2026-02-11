import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('next-themes', () => ({
    useTheme: () => ({ theme: 'light' }),
}));

import { Toaster } from '../sonner';

describe('Toaster', () => {
    it('should render sonner toaster', () => {
        expect(() => render(<Toaster />)).not.toThrow();
    });
});
