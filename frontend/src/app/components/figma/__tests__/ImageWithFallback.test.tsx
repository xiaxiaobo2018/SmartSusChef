import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageWithFallback } from '../ImageWithFallback';

describe('ImageWithFallback', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ==================== Rendering Tests ====================
    describe('Rendering', () => {
        it('should render img element with src and alt', () => {
            render(<ImageWithFallback src="test-image.jpg" alt="Test Image" />);

            const img = screen.getByAltText('Test Image');
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', 'test-image.jpg');
        });

        it('should apply className to img element', () => {
            render(<ImageWithFallback src="test.jpg" alt="Test" className="custom-class" />);

            const img = screen.getByAltText('Test');
            expect(img).toHaveClass('custom-class');
        });

        it('should apply style to img element', () => {
            const style = { width: '100px', height: '100px' };
            render(<ImageWithFallback src="test.jpg" alt="Test" style={style} />);

            const img = screen.getByAltText('Test');
            expect(img).toHaveStyle({ width: '100px', height: '100px' });
        });

        it('should pass through additional HTML attributes', () => {
            render(
                <ImageWithFallback
                    src="test.jpg"
                    alt="Test"
                    width={200}
                    height={150}
                    loading="lazy"
                    data-testid="custom-img"
                />
            );

            const img = screen.getByTestId('custom-img');
            expect(img).toHaveAttribute('width', '200');
            expect(img).toHaveAttribute('height', '150');
            expect(img).toHaveAttribute('loading', 'lazy');
        });

        it('should render without className and style', () => {
            render(<ImageWithFallback src="test.jpg" alt="Test" />);

            const img = screen.getByAltText('Test');
            expect(img).toBeInTheDocument();
        });

        it('should handle empty alt text', () => {
            const { container } = render(<ImageWithFallback src="test.jpg" alt="" />);

            const img = container.querySelector('img');
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('alt', '');
        });
    });

    // ==================== Error Handling Tests ====================
    describe('Error Handling', () => {
        it('should display fallback when image fails to load', () => {
            render(<ImageWithFallback src="broken-image.jpg" alt="Test Image" />);

            const img = screen.getByAltText('Test Image');
            fireEvent.error(img);

            // Should show error fallback image
            const errorImg = screen.getByAltText('Error loading image');
            expect(errorImg).toBeInTheDocument();
        });

        it('should display error SVG in fallback', () => {
            render(<ImageWithFallback src="broken.jpg" alt="Test" />);

            const img = screen.getByAltText('Test');
            fireEvent.error(img);

            const errorImg = screen.getByAltText('Error loading image');
            expect(errorImg).toHaveAttribute('src', expect.stringContaining('data:image/svg+xml;base64'));
        });

        it('should preserve original URL in data-original-url attribute', () => {
            const originalUrl = 'https://example.com/image.jpg';
            render(<ImageWithFallback src={originalUrl} alt="Test" />);

            const img = screen.getByAltText('Test');
            fireEvent.error(img);

            const errorImg = screen.getByAltText('Error loading image');
            expect(errorImg).toHaveAttribute('data-original-url', originalUrl);
        });

        it('should apply className to fallback container', () => {
            render(<ImageWithFallback src="broken.jpg" alt="Test" className="custom-class" />);

            const img = screen.getByAltText('Test');
            fireEvent.error(img);

            const fallbackContainer = screen.getByAltText('Error loading image').closest('div');
            expect(fallbackContainer?.parentElement).toHaveClass('custom-class');
        });

        it('should apply style to fallback container', () => {
            const style = { width: '200px', height: '200px' };
            render(<ImageWithFallback src="broken.jpg" alt="Test" style={style} />);

            const img = screen.getByAltText('Test');
            fireEvent.error(img);

            const fallbackContainer = screen.getByAltText('Error loading image').closest('div');
            expect(fallbackContainer?.parentElement).toHaveStyle(style);
        });

        it('should preserve additional HTML attributes in fallback', () => {
            render(
                <ImageWithFallback
                    src="broken.jpg"
                    alt="Test"
                    width={300}
                    height={200}
                    data-testid="broken-img"
                />
            );

            const img = screen.getByAltText('Test');
            fireEvent.error(img);

            const errorImg = screen.getByAltText('Error loading image');
            expect(errorImg).toHaveAttribute('width', '300');
            expect(errorImg).toHaveAttribute('height', '200');
            expect(errorImg).toHaveAttribute('data-testid', 'broken-img');
        });

        it('should display fallback with correct structure', () => {
            render(<ImageWithFallback src="broken.jpg" alt="Test" />);

            const img = screen.getByAltText('Test');
            fireEvent.error(img);

            // Check fallback structure
            const errorImg = screen.getByAltText('Error loading image');
            const innerDiv = errorImg.closest('div');
            const outerDiv = innerDiv?.parentElement;

            expect(innerDiv).toHaveClass('flex', 'items-center', 'justify-center', 'w-full', 'h-full');
            expect(outerDiv).toHaveClass('inline-block', 'bg-gray-100', 'text-center', 'align-middle');
        });

        it('should remain in error state after error occurs', () => {
            render(<ImageWithFallback src="broken.jpg" alt="Test" />);

            const img = screen.getByAltText('Test');
            fireEvent.error(img);

            // Verify error image is shown
            expect(screen.getByAltText('Error loading image')).toBeInTheDocument();
            expect(screen.queryByAltText('Test')).not.toBeInTheDocument();
        });
    });

    // ==================== Edge Cases ====================
    describe('Edge Cases', () => {
        it('should handle missing src attribute', () => {
            render(<ImageWithFallback alt="Test" />);

            const img = screen.getByAltText('Test');
            expect(img).toBeInTheDocument();
        });

        it('should handle undefined src', () => {
            render(<ImageWithFallback src={undefined as any} alt="Test" />);

            const img = screen.getByAltText('Test');
            expect(img).toBeInTheDocument();
        });

        it('should handle empty string src', () => {
            render(<ImageWithFallback src="" alt="Test" />);

            const img = screen.getByAltText('Test');
            expect(img).toHaveAttribute('src', '');
        });

        it('should apply empty className to fallback when not provided', () => {
            render(<ImageWithFallback src="broken.jpg" alt="Test" />);

            const img = screen.getByAltText('Test');
            fireEvent.error(img);

            const fallbackContainer = screen.getByAltText('Error loading image').closest('div');
            // Should still have base classes
            expect(fallbackContainer?.parentElement).toHaveClass('inline-block', 'bg-gray-100');
        });

        it('should handle multiple error events', () => {
            render(<ImageWithFallback src="broken.jpg" alt="Test" />);

            const img = screen.getByAltText('Test');

            // Trigger error multiple times
            fireEvent.error(img);
            fireEvent.error(img);

            // Should only have one error image
            expect(screen.getByAltText('Error loading image')).toBeInTheDocument();
            expect(screen.queryByAltText('Test')).not.toBeInTheDocument();
        });

        it('should handle very long src URLs', () => {
            const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '.jpg';
            render(<ImageWithFallback src={longUrl} alt="Test" />);

            const img = screen.getByAltText('Test');
            fireEvent.error(img);

            const errorImg = screen.getByAltText('Error loading image');
            expect(errorImg).toHaveAttribute('data-original-url', longUrl);
        });

        it('should handle special characters in alt text', () => {
            const specialAlt = 'Test <>"&\'';
            render(<ImageWithFallback src="test.jpg" alt={specialAlt} />);

            const img = screen.getByAltText(specialAlt);
            expect(img).toBeInTheDocument();
        });
    });

    // ==================== Integration Tests ====================
    describe('Integration', () => {
        it('should render without crashing', () => {
            expect(() => {
                render(<ImageWithFallback src="test.jpg" alt="Test" />);
            }).not.toThrow();
        });

        it('should handle transition from success to error state', () => {
            const { rerender } = render(<ImageWithFallback src="good.jpg" alt="Test" />);

            // Initially should show the image
            const img = screen.getByAltText('Test');
            expect(img).toHaveAttribute('src', 'good.jpg');

            // Trigger error
            fireEvent.error(img);

            // Should now show error image
            expect(screen.getByAltText('Error loading image')).toBeInTheDocument();
            expect(screen.queryByAltText('Test')).not.toBeInTheDocument();

            // Rerender with new src (simulating prop change)
            rerender(<ImageWithFallback src="also-broken.jpg" alt="Test" />);

            // Should still be in error state (component doesn't reset error state on prop change)
            expect(screen.queryByAltText('Error loading image')).toBeInTheDocument();
        });

        it('should apply both className and style together', () => {
            const style = { border: '1px solid red' };
            render(<ImageWithFallback src="test.jpg" alt="Test" className="my-class" style={style} />);

            const img = screen.getByAltText('Test');
            expect(img).toHaveClass('my-class');
            expect(img).toHaveStyle({ border: '1px solid red' });
        });

        it('should handle all props together', () => {
            render(
                <ImageWithFallback
                    src="test.jpg"
                    alt="Full Test"
                    className="full-class"
                    style={{ width: '100px' }}
                    width={100}
                    height={100}
                    loading="lazy"
                    data-testid="full-test"
                />
            );

            const img = screen.getByTestId('full-test');
            expect(img).toHaveAttribute('src', 'test.jpg');
            expect(img).toHaveAttribute('alt', 'Full Test');
            expect(img).toHaveClass('full-class');
            expect(img).toHaveStyle({ width: '100px' });
            expect(img).toHaveAttribute('width', '100');
            expect(img).toHaveAttribute('height', '100');
            expect(img).toHaveAttribute('loading', 'lazy');
        });

        it('should maintain fallback display with all props', () => {
            render(
                <ImageWithFallback
                    src="broken.jpg"
                    alt="Full Test"
                    className="error-class"
                    style={{ backgroundColor: 'red' }}
                    width={150}
                    data-testid="error-test"
                />
            );

            const img = screen.getByAltText('Full Test');
            fireEvent.error(img);

            const errorImg = screen.getByAltText('Error loading image');
            const fallbackOuter = errorImg.closest('div')?.parentElement;

            expect(errorImg).toHaveAttribute('data-original-url', 'broken.jpg');
            expect(errorImg).toHaveAttribute('width', '150');
            expect(errorImg).toHaveAttribute('data-testid', 'error-test');
            expect(fallbackOuter).toHaveClass('error-class');
            expect(fallbackOuter).toHaveStyle({ backgroundColor: 'red' });
        });
    });

    // ==================== State Management ====================
    describe('State Management', () => {
        it('should start with didError state as false', () => {
            render(<ImageWithFallback src="test.jpg" alt="Test" />);

            // Should show original image, not error fallback
            expect(screen.getByAltText('Test')).toBeInTheDocument();
            expect(screen.queryByAltText('Error loading image')).not.toBeInTheDocument();
        });

        it('should update didError state to true after error', () => {
            render(<ImageWithFallback src="broken.jpg" alt="Test" />);

            const img = screen.getByAltText('Test');
            fireEvent.error(img);

            // State should be updated, showing error fallback
            expect(screen.getByAltText('Error loading image')).toBeInTheDocument();
            expect(screen.queryByAltText('Test')).not.toBeInTheDocument();
        });

        it('should persist error state', () => {
            render(<ImageWithFallback src="broken.jpg" alt="Test" />);

            const img = screen.getByAltText('Test');
            fireEvent.error(img);

            // Wait a bit and check state persists
            expect(screen.getByAltText('Error loading image')).toBeInTheDocument();

            // Trigger another event (like a click) to ensure state doesn't reset
            const errorImg = screen.getByAltText('Error loading image');
            fireEvent.click(errorImg);

            expect(screen.getByAltText('Error loading image')).toBeInTheDocument();
        });
    });
});
