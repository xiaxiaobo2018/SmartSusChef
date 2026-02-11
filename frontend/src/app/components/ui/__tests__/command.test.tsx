import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
    Command,
    CommandInput,
    CommandList,
    CommandItem,
    CommandEmpty,
} from '../command';

describe('Command', () => {
    it('should render command palette structure', () => {
        const { container } = render(
            <Command>
                <CommandInput placeholder="Search" />
                <CommandList>
                    <CommandItem>Item 1</CommandItem>
                    <CommandEmpty>No results</CommandEmpty>
                </CommandList>
            </Command>
        );

        expect(container.querySelector('[data-slot="command"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="command-input"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="command-list"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="command-item"]')).toBeInTheDocument();
        expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
});
