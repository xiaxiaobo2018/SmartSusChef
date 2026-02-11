import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockApi = {
    canScrollPrev: vi.fn(() => true),
    canScrollNext: vi.fn(() => true),
    on: vi.fn(),
    off: vi.fn(),
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
};

vi.mock('embla-carousel-react', () => ({
    default: () => [vi.fn(), mockApi],
}));

import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../carousel';

describe('Carousel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render carousel structure', () => {
        const { container } = render(
            <Carousel>
                <CarouselContent>
                    <CarouselItem>Slide 1</CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        );

        expect(container.querySelector('[data-slot="carousel"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="carousel-content"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="carousel-item"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="carousel-previous"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="carousel-next"]')).toBeInTheDocument();
    });

    it('should call scroll actions on button click', async () => {
        const user = userEvent.setup();
        render(
            <Carousel>
                <CarouselContent>
                    <CarouselItem>Slide 1</CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        );

        await user.click(screen.getByRole('button', { name: /previous slide/i }));
        await user.click(screen.getByRole('button', { name: /next slide/i }));

        expect(mockApi.scrollPrev).toHaveBeenCalled();
        expect(mockApi.scrollNext).toHaveBeenCalled();
    });
});
