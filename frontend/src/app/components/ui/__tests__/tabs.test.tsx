import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs';

describe('Tabs', () => {
    it('should render tabs structure with data-slot', () => {
        const { container } = render(
            <Tabs defaultValue="a">
                <TabsList>
                    <TabsTrigger value="a">Tab A</TabsTrigger>
                    <TabsTrigger value="b">Tab B</TabsTrigger>
                </TabsList>
                <TabsContent value="a">Content A</TabsContent>
                <TabsContent value="b">Content B</TabsContent>
            </Tabs>
        );

        expect(container.querySelector('[data-slot="tabs"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="tabs-list"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="tabs-trigger"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="tabs-content"]')).toBeInTheDocument();
    });

    it('should switch content when clicking trigger', async () => {
        const user = userEvent.setup();
        render(
            <Tabs defaultValue="a">
                <TabsList>
                    <TabsTrigger value="a">Tab A</TabsTrigger>
                    <TabsTrigger value="b">Tab B</TabsTrigger>
                </TabsList>
                <TabsContent value="a">Content A</TabsContent>
                <TabsContent value="b">Content B</TabsContent>
            </Tabs>
        );

        expect(screen.getByText('Content A')).toBeVisible();

        await user.click(screen.getByText('Tab B'));
        expect(screen.getByText('Content B')).toBeVisible();
    });
});
