import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from '../drawer';

describe('Drawer', () => {
    it('should render drawer content when open', async () => {
        render(
            <Drawer open>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Title</DrawerTitle>
                        <DrawerDescription>Description</DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>Footer</DrawerFooter>
                </DrawerContent>
            </Drawer>
        );

        await waitFor(() => {
            expect(document.querySelector('[data-slot="drawer-content"]')).toBeInTheDocument();
            expect(document.querySelector('[data-slot="drawer-header"]')).toBeInTheDocument();
            expect(document.querySelector('[data-slot="drawer-title"]')).toBeInTheDocument();
            expect(document.querySelector('[data-slot="drawer-description"]')).toBeInTheDocument();
            expect(document.querySelector('[data-slot="drawer-footer"]')).toBeInTheDocument();
        });
    });
});
