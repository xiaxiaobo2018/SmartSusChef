import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Avatar, AvatarFallback } from '../avatar';

describe('Avatar', () => {
    it('should render avatar root', () => {
        const { container } = render(
            <Avatar>
                <AvatarFallback>UA</AvatarFallback>
            </Avatar>
        );

        expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument();
        expect(screen.getByText('UA')).toBeInTheDocument();
    });

    it('should render fallback content', () => {
        render(
            <Avatar>
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
        );

        expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should apply custom className to root', () => {
        const { container } = render(<Avatar className="custom-avatar" />);

        const avatar = container.querySelector('[data-slot="avatar"]');
        expect(avatar).toHaveClass('custom-avatar');
    });
});
