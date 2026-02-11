import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from '../pagination';

describe('Pagination', () => {
    it('should render pagination structure', () => {
        const { container } = render(
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" isActive>
                            1
                        </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#" />
                    </PaginationItem>
                    <PaginationEllipsis />
                </PaginationContent>
            </Pagination>
        );

        expect(container.querySelector('[data-slot="pagination"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="pagination-content"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="pagination-item"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="pagination-link"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="pagination-ellipsis"]')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
    });
});
