import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../accordion';

describe('Accordion', () => {
    it('should render accordion structure', () => {
        const { container } = render(
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger>Item 1</AccordionTrigger>
                    <AccordionContent>Content 1</AccordionContent>
                </AccordionItem>
            </Accordion>
        );

        expect(container.querySelector('[data-slot="accordion"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="accordion-item"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="accordion-trigger"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="accordion-content"]')).toBeInTheDocument();
    });

    it('should toggle content on trigger click', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger>Item 1</AccordionTrigger>
                    <AccordionContent>Content 1</AccordionContent>
                </AccordionItem>
            </Accordion>
        );

        const content = container.querySelector('[data-slot="accordion-content"]');
        expect(content).toHaveAttribute('data-state', 'closed');
        await user.click(screen.getByText('Item 1'));

        expect(content).toHaveAttribute('data-state', 'open');
    });
});
