import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Input } from '../input';

describe('Input', () => {
    it('should render input with data-slot and type', () => {
        render(<Input type="email" placeholder="Email" />);

        const input = screen.getByPlaceholderText('Email');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'email');
        expect(input).toHaveAttribute('data-slot', 'input');
    });

    it('should apply custom className', () => {
        const { container } = render(<Input className="custom-input" />);

        const input = container.querySelector('input');
        expect(input).toHaveClass('custom-input');
        expect(input).toHaveClass('bg-white');
    });

    it('should accept value and change handler', () => {
        render(<Input value="Hello" onChange={() => {}} />);

        const input = screen.getByDisplayValue('Hello');
        expect(input).toBeInTheDocument();
    });
});
