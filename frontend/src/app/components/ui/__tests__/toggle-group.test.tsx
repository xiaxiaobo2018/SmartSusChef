import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '../toggle-group';

describe('ToggleGroup', () => {
    it('should render toggle group items', () => {
        const { container } = render(
            <ToggleGroup type="single" defaultValue="a">
                <ToggleGroupItem value="a">A</ToggleGroupItem>
                <ToggleGroupItem value="b">B</ToggleGroupItem>
            </ToggleGroup>
        );

        expect(container.querySelector('[data-slot="toggle-group"]')).toBeInTheDocument();
        expect(container.querySelectorAll('[data-slot="toggle-group-item"]').length).toBe(2);
    });
});
