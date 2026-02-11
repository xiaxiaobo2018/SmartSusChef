import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
} from '../select';

describe('Select', () => {
    it('should render trigger with placeholder', () => {
        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Pick one" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                </SelectContent>
            </Select>
        );

        expect(screen.getByText('Pick one')).toBeInTheDocument();
        expect(document.querySelector('[data-slot="select-trigger"]')).toBeInTheDocument();
    });

    it('should open and select an item', async () => {
        const user = userEvent.setup();
        render(
            <Select defaultValue="apple">
                <SelectTrigger>
                    <SelectValue placeholder="Pick one" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                </SelectContent>
            </Select>
        );

        expect(screen.getByText('Apple')).toBeInTheDocument();

        await user.click(screen.getByRole('combobox'));
        await user.click(await screen.findByText('Orange'));

        await waitFor(() => {
            expect(screen.getByText('Orange')).toBeInTheDocument();
        });
    });

    it('should render label and separator inside content', async () => {
        const user = userEvent.setup();
        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Pick one" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Fruits</SelectLabel>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectSeparator />
                        <SelectItem value="orange">Orange</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        );

        await user.click(screen.getByRole('combobox'));

        expect(document.querySelector('[data-slot="select-content"]')).toBeInTheDocument();
        expect(document.querySelector('[data-slot="select-label"]')).toBeInTheDocument();
        expect(document.querySelector('[data-slot="select-separator"]')).toBeInTheDocument();
    });
});
