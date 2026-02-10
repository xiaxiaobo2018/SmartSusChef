import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Toggle } from '../toggle';

describe('Toggle', () => {
    it('should toggle pressed state', async () => {
        const user = userEvent.setup();
        render(<Toggle>Bold</Toggle>);

        const toggle = screen.getByRole('button');
        expect(toggle).toHaveAttribute('aria-pressed', 'false');

        await user.click(toggle);
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });
});
