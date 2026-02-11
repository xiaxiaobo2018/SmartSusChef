import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
} from '../card';

describe('Card', () => {
    it('should render card structure with data-slot attributes', () => {
        const { container } = render(
            <Card>
                <CardHeader>
                    <CardTitle>Title</CardTitle>
                    <CardDescription>Description</CardDescription>
                    <CardAction>Action</CardAction>
                </CardHeader>
                <CardContent>Content</CardContent>
                <CardFooter>Footer</CardFooter>
            </Card>
        );

        expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="card-header"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="card-title"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="card-description"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="card-action"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="card-content"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="card-footer"]')).toBeInTheDocument();
    });

    it('should render content text', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent>Details</CardContent>
            </Card>
        );

        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('should apply custom className and inline styles', () => {
        const { container } = render(<Card className="custom-card">Card</Card>);

        const card = container.querySelector('[data-slot="card"]');
        expect(card).toHaveClass('custom-card');
        expect(card).toHaveStyle({ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)' });
    });
});
