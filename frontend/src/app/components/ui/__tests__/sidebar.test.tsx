import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from '../sidebar';

describe('Sidebar', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: (query: string) => ({
                media: query,
                matches: false,
                addEventListener: () => {},
                removeEventListener: () => {},
            }),
        });
    });

    it('should render sidebar wrapper and sections', () => {
        const { container } = render(
            <SidebarProvider>
                <Sidebar>
                    <SidebarHeader>Header</SidebarHeader>
                    <SidebarContent>Content</SidebarContent>
                    <SidebarFooter>Footer</SidebarFooter>
                </Sidebar>
            </SidebarProvider>
        );

        expect(container.querySelector('[data-slot="sidebar-wrapper"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="sidebar"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="sidebar-header"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="sidebar-content"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="sidebar-footer"]')).toBeInTheDocument();
    });
});
