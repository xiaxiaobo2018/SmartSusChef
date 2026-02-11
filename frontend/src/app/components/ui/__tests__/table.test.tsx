import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
} from '../table';

describe('Table Components', () => {
    describe('Table', () => {
        it('should render table element', () => {
            const { container } = render(
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Cell</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            const table = container.querySelector('table[data-slot="table"]');
            expect(table).toBeInTheDocument();
        });

        it('should have table container wrapper', () => {
            const { container } = render(
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Cell</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            const tableContainer = container.querySelector('[data-slot="table-container"]');
            expect(tableContainer).toBeInTheDocument();
            expect(tableContainer).toHaveClass('overflow-x-auto');
        });

        it('should apply custom className', () => {
            const { container } = render(
                <Table className="custom-table">
                    <TableBody>
                        <TableRow>
                            <TableCell>Cell</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            const table = container.querySelector('table');
            expect(table).toHaveClass('custom-table');
        });
    });

    describe('TableHeader', () => {
        it('should render thead element', () => {
            const { container } = render(
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Header</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            );

            const thead = container.querySelector('thead[data-slot="table-header"]');
            expect(thead).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            const { container } = render(
                <Table>
                    <TableHeader className="custom-header">
                        <TableRow>
                            <TableHead>Header</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            );

            const thead = container.querySelector('thead');
            expect(thead).toHaveClass('custom-header');
        });
    });

    describe('TableBody', () => {
        it('should render tbody element', () => {
            const { container } = render(
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Cell</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            const tbody = container.querySelector('tbody[data-slot="table-body"]');
            expect(tbody).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            const { container } = render(
                <Table>
                    <TableBody className="custom-body">
                        <TableRow>
                            <TableCell>Cell</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            const tbody = container.querySelector('tbody');
            expect(tbody).toHaveClass('custom-body');
        });
    });

    describe('TableFooter', () => {
        it('should render tfoot element', () => {
            const { container } = render(
                <Table>
                    <TableFooter>
                        <TableRow>
                            <TableCell>Footer</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            );

            const tfoot = container.querySelector('tfoot[data-slot="table-footer"]');
            expect(tfoot).toBeInTheDocument();
        });

        it('should have footer styles', () => {
            const { container } = render(
                <Table>
                    <TableFooter>
                        <TableRow>
                            <TableCell>Footer</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            );

            const tfoot = container.querySelector('tfoot');
            expect(tfoot).toHaveClass('bg-muted/50', 'border-t', 'font-medium');
        });
    });

    describe('TableRow', () => {
        it('should render tr element', () => {
            const { container } = render(
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Cell</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            const tr = container.querySelector('tr[data-slot="table-row"]');
            expect(tr).toBeInTheDocument();
        });

        it('should have hover and border styles', () => {
            const { container } = render(
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Cell</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            const tr = container.querySelector('tr');
            expect(tr).toHaveClass('hover:bg-muted/50', 'border-b', 'transition-colors');
        });

        it('should apply custom className', () => {
            const { container } = render(
                <Table>
                    <TableBody>
                        <TableRow className="custom-row">
                            <TableCell>Cell</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            const tr = container.querySelector('tr');
            expect(tr).toHaveClass('custom-row');
        });
    });

    describe('TableHead', () => {
        it('should render th element', () => {
            const { container } = render(
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Header</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            );

            const th = container.querySelector('th[data-slot="table-head"]');
            expect(th).toBeInTheDocument();
        });

        it('should display header text', () => {
            render(
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Column Header</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            );

            expect(screen.getByText('Column Header')).toBeInTheDocument();
        });

        it('should have proper text alignment', () => {
            const { container } = render(
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Header</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            );

            const th = container.querySelector('th');
            expect(th).toHaveClass('text-left');
        });
    });

    describe('TableCell', () => {
        it('should render td element', () => {
            const { container } = render(
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Cell Content</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            const td = container.querySelector('td[data-slot="table-cell"]');
            expect(td).toBeInTheDocument();
        });

        it('should display cell content', () => {
            render(
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Test Content</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            expect(screen.getByText('Test Content')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            const { container } = render(
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="custom-cell">Cell</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            const td = container.querySelector('td');
            expect(td).toHaveClass('custom-cell');
        });
    });

    describe('TableCaption', () => {
        it('should render caption element', () => {
            const { container } = render(
                <Table>
                    <TableCaption>Table Caption</TableCaption>
                    <TableBody>
                        <TableRow>
                            <TableCell>Cell</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            const caption = container.querySelector('caption[data-slot="table-caption"]');
            expect(caption).toBeInTheDocument();
        });

        it('should display caption text', () => {
            render(
                <Table>
                    <TableCaption>Sales Data Table</TableCaption>
                    <TableBody>
                        <TableRow>
                            <TableCell>Cell</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            expect(screen.getByText('Sales Data Table')).toBeInTheDocument();
        });
    });

    describe('Complete Table Structure', () => {
        it('should render complete table with all components', () => {
            render(
                <Table>
                    <TableCaption>Complete Table</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Item 1</TableCell>
                            <TableCell>100</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Item 2</TableCell>
                            <TableCell>200</TableCell>
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell>Total</TableCell>
                            <TableCell>300</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            );

            expect(screen.getByText('Complete Table')).toBeInTheDocument();
            expect(screen.getByText('Name')).toBeInTheDocument();
            expect(screen.getByText('Value')).toBeInTheDocument();
            expect(screen.getByText('Item 1')).toBeInTheDocument();
            expect(screen.getByText('Item 2')).toBeInTheDocument();
            expect(screen.getByText('Total')).toBeInTheDocument();
            expect(screen.getByText('300')).toBeInTheDocument();
        });

        it('should render multiple rows correctly', () => {
            const { container } = render(
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Row 1</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Row 2</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Row 3</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            const rows = container.querySelectorAll('tr');
            expect(rows).toHaveLength(3);
        });
    });

    describe('Data Slot Attributes', () => {
        it('should have correct data-slot for all components', () => {
            const { container } = render(
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Header</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Cell</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            );

            expect(container.querySelector('[data-slot="table-container"]')).toBeInTheDocument();
            expect(container.querySelector('[data-slot="table"]')).toBeInTheDocument();
            expect(container.querySelector('[data-slot="table-header"]')).toBeInTheDocument();
            expect(container.querySelector('[data-slot="table-body"]')).toBeInTheDocument();
            expect(container.querySelector('[data-slot="table-row"]')).toBeInTheDocument();
            expect(container.querySelector('[data-slot="table-head"]')).toBeInTheDocument();
            expect(container.querySelector('[data-slot="table-cell"]')).toBeInTheDocument();
        });
    });
});
