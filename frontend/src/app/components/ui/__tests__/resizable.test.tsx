import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../resizable';

describe('Resizable', () => {
    it('should render resizable panel group and handle', () => {
        const { container } = render(
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50}>Left</ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>Right</ResizablePanel>
            </ResizablePanelGroup>
        );

        expect(container.querySelector('[data-slot="resizable-panel-group"]')).toBeInTheDocument();
        expect(container.querySelectorAll('[data-slot="resizable-panel"]').length).toBe(2);
        expect(container.querySelector('[data-slot="resizable-handle"]')).toBeInTheDocument();
    });
});
