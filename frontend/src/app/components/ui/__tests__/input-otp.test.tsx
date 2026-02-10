import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { OTPInputContext } from 'input-otp';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../input-otp';

describe('InputOTP', () => {
    it('should render OTP container', () => {
        const { container } = render(
            <InputOTP
                maxLength={2}
                render={() => (
                    <InputOTPGroup>
                        <div>Slot</div>
                    </InputOTPGroup>
                )}
            />
        );

        expect(container.querySelector('[data-slot="input-otp"]')).toBeInTheDocument();
        expect(container.querySelector('[data-slot="input-otp-group"]')).toBeInTheDocument();
    });

    it('should render OTP slots with context', () => {
        const { container } = render(
            <OTPInputContext.Provider
                value={{
                    slots: [
                        { char: '1', hasFakeCaret: false, isActive: true },
                        { char: '2', hasFakeCaret: false, isActive: false },
                    ],
                } as any}
            >
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSeparator />
                    <InputOTPSlot index={1} />
                </InputOTPGroup>
            </OTPInputContext.Provider>
        );

        expect(container.querySelector('[data-slot="input-otp-group"]')).toBeInTheDocument();
        expect(container.querySelectorAll('[data-slot="input-otp-slot"]').length).toBe(2);
        expect(container.querySelector('[data-slot="input-otp-separator"]')).toBeInTheDocument();
    });
});
