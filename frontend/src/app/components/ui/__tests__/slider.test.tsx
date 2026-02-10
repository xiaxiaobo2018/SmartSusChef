import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Slider } from '../slider';

describe('Slider', () => {
    it('should render slider track and thumbs', () => {
        const { container } = render(<Slider defaultValue={[20]} />);

        expect(container.querySelector('[data-slot="slider"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="slider-track"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="slider-range"]')).toBeInTheDocument();
        expect(container.querySelectorAll('[data-slot="slider-thumb"]').length).toBe(1);
    });
});
