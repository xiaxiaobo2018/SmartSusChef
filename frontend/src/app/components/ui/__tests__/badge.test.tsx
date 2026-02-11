import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge', () => {
    describe('Rendering', () => {
        it('should render badge with text', () => {
            render(<Badge>Test Badge</Badge>);

            expect(screen.getByText('Test Badge')).toBeInTheDocument();
        });

        it('should render badge with default variant', () => {
            const { container } = render(<Badge>Default</Badge>);

            const badge = container.querySelector('[data-slot="badge"]');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('bg-primary');
        });
    });

    describe('Variants', () => {
        it('should render default variant correctly', () => {
            const { container } = render(<Badge variant="default">Default Badge</Badge>);

            const badge = container.querySelector('[data-slot="badge"]');
            expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
        });

        it('should render secondary variant correctly', () => {
            const { container } = render(<Badge variant="secondary">Secondary Badge</Badge>);

            const badge = container.querySelector('[data-slot="badge"]');
            expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground');
        });

        it('should render destructive variant correctly', () => {
            const { container } = render(<Badge variant="destructive">Destructive Badge</Badge>);

            const badge = container.querySelector('[data-slot="badge"]');
            expect(badge).toHaveClass('bg-destructive', 'text-white');
        });

        it('should render outline variant correctly', () => {
            const { container } = render(<Badge variant="outline">Outline Badge</Badge>);

            const badge = container.querySelector('[data-slot="badge"]');
            expect(badge).toHaveClass('text-foreground');
        });
    });

    describe('Custom Styling', () => {
        it('should apply custom className', () => {
            const { container } = render(<Badge className="custom-class">Custom</Badge>);

            const badge = container.querySelector('[data-slot="badge"]');
            expect(badge).toHaveClass('custom-class');
        });

        it('should merge custom className with default classes', () => {
            const { container } = render(<Badge className="my-custom-class">Merged</Badge>);

            const badge = container.querySelector('[data-slot="badge"]');
            expect(badge).toHaveClass('my-custom-class');
            expect(badge).toHaveClass('inline-flex'); // Default class
        });
    });

    describe('Content', () => {
        it('should render children correctly', () => {
            render(
                <Badge>
                    <span>Icon</span>
                    <span>Text</span>
                </Badge>
            );

            expect(screen.getByText('Icon')).toBeInTheDocument();
            expect(screen.getByText('Text')).toBeInTheDocument();
        });

        it('should render with icon', () => {
            render(
                <Badge>
                    <svg data-testid="test-icon" />
                    Badge Text
                </Badge>
            );

            expect(screen.getByTestId('test-icon')).toBeInTheDocument();
            expect(screen.getByText('Badge Text')).toBeInTheDocument();
        });
    });

    describe('AsChild Prop', () => {
        it('should render as span by default', () => {
            const { container } = render(<Badge>Default Span</Badge>);

            const badge = container.querySelector('span[data-slot="badge"]');
            expect(badge).toBeInTheDocument();
        });

        it('should use Slot component when asChild is true', () => {
            render(
                <Badge asChild>
                    <a href="/test">Link Badge</a>
                </Badge>
            );

            expect(screen.getByText('Link Badge')).toBeInTheDocument();
        });
    });

    describe('Attributes', () => {
        it('should accept data attributes', () => {
            render(
                <Badge data-testid="custom-badge" data-value="123">
                    Attributed Badge
                </Badge>
            );

            expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
            expect(screen.getByTestId('custom-badge')).toHaveAttribute('data-value', '123');
        });

        it('should have correct data-slot attribute', () => {
            const { container } = render(<Badge>Slotted</Badge>);

            const badge = container.querySelector('[data-slot="badge"]');
            expect(badge).toBeInTheDocument();
        });
    });

    describe('Multiple Badges', () => {
        it('should render multiple badges independently', () => {
            render(
                <div>
                    <Badge variant="default">Badge 1</Badge>
                    <Badge variant="secondary">Badge 2</Badge>
                    <Badge variant="destructive">Badge 3</Badge>
                </div>
            );

            expect(screen.getByText('Badge 1')).toBeInTheDocument();
            expect(screen.getByText('Badge 2')).toBeInTheDocument();
            expect(screen.getByText('Badge 3')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should render with proper ARIA attributes when provided', () => {
            render(<Badge aria-label="Status badge">Active</Badge>);

            expect(screen.getByLabelText('Status badge')).toBeInTheDocument();
        });
    });
});
