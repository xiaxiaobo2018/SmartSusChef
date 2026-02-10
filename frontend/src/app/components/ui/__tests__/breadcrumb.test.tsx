import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
} from '../breadcrumb';

describe('Breadcrumb', () => {
    it('should render breadcrumb structure', () => {
        const { container } = render(
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Current</BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbEllipsis />
                </BreadcrumbList>
            </Breadcrumb>
        );

        expect(container.querySelector('[data-slot="breadcrumb"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="breadcrumb-list"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="breadcrumb-item"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="breadcrumb-link"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="breadcrumb-page"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="breadcrumb-separator"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="breadcrumb-ellipsis"]')).toBeInTheDocument();

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Current')).toBeInTheDocument();
    });
});
