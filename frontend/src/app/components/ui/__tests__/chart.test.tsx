import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="responsive">{children}</div>
    ),
    Tooltip: () => null,
    Legend: () => null,
}));

import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '../chart';

describe('Chart', () => {
    it('should render chart container and style', () => {
        const config = {
            value: { label: 'Value', color: '#000' },
        };

        const { container } = render(
            <ChartContainer config={config}>
                <div data-testid="chart-child" />
            </ChartContainer>
        );

        expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument();
        expect(screen.getByTestId('chart-child')).toBeInTheDocument();
        const style = container.querySelector('style');
        expect(style).toBeInTheDocument();
    });

    it('should render tooltip and legend content', () => {
        const config = {
            value: { label: 'Value', color: '#000' },
        };

        const payload = [
            {
                name: 'value',
                dataKey: 'value',
                value: 123,
                color: '#000',
                payload: { value: 123 },
            },
        ];

        render(
            <ChartContainer config={config}>
                <div>
                    <ChartTooltipContent active payload={payload} />
                    <ChartLegendContent payload={payload as any} />
                </div>
            </ChartContainer>
        );

        expect(screen.getAllByText('Value').length).toBeGreaterThan(1);
        expect(screen.getByText('123')).toBeInTheDocument();
    });
});
