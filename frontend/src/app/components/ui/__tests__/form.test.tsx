import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from '../form';

function TestForm({ showError }: { showError?: boolean }) {
    const form = useForm({ defaultValues: { name: '' } });

    React.useEffect(() => {
        if (showError) {
            form.setError('name', { type: 'manual', message: 'Required' });
        }
    }, [showError, form]);

    return (
        <Form {...form}>
            <form>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <input {...field} />
                            </FormControl>
                            <FormDescription>Enter your name</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}

describe('Form', () => {
    it('should render form item and description', () => {
        const { container } = render(<TestForm />);

        expect(container.querySelector('[data-slot="form-item"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="form-label"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="form-control"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="form-description"]')).toBeInTheDocument();
        expect(screen.getByText('Enter your name')).toBeInTheDocument();
    });

    it('should render error message when provided', () => {
        render(<TestForm showError />);

        expect(screen.getByText('Required')).toBeInTheDocument();
    });
});
