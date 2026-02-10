import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { RadioGroup, RadioGroupItem } from '../radio-group';

describe('RadioGroup', () => {
    it('should render radio items and allow selection', async () => {
        const user = userEvent.setup();
        render(
            <RadioGroup defaultValue="a">
                <RadioGroupItem value="a" aria-label="Option A" />
                <RadioGroupItem value="b" aria-label="Option B" />
            </RadioGroup>
        );

        const optionB = screen.getByLabelText('Option B');
        await user.click(optionB);

        expect(optionB).toHaveAttribute('aria-checked', 'true');
    });
});
