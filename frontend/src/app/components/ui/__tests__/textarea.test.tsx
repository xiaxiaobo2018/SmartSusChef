import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Textarea } from '../textarea';

describe('Textarea', () => {
    it('should render textarea with data-slot', () => {
        render(<Textarea placeholder="Notes" />);

        const textarea = screen.getByPlaceholderText('Notes');
        expect(textarea).toBeInTheDocument();
        expect(textarea).toHaveAttribute('data-slot', 'textarea');
    });

    it('should apply custom className', () => {
        const { container } = render(<Textarea className="custom-textarea" />);

        const textarea = container.querySelector('textarea');
        expect(textarea).toHaveClass('custom-textarea');
        expect(textarea).toHaveClass('resize-none');
    });

    it('should accept default value', () => {
        render(<Textarea defaultValue="Initial content" />);

        const textarea = screen.getByDisplayValue('Initial content');
        expect(textarea).toBeInTheDocument();
    });
});
