import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
} from '../navigation-menu';

describe('NavigationMenu', () => {
    it('should open content when trigger is clicked', async () => {
        const user = userEvent.setup();
        render(
            <NavigationMenu viewport={false}>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <NavigationMenuLink href="/docs">Getting Started</NavigationMenuLink>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        );

        await user.click(screen.getByText('Docs'));

        await waitFor(() => {
            expect(document.querySelector('[data-slot="navigation-menu-content"]')).toBeInTheDocument();
            expect(document.querySelector('[data-slot="navigation-menu-link"]')).toBeInTheDocument();
        });
    });
});
