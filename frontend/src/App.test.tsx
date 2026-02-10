import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App'; // This will likely cause an error if App.tsx doesn't exist yet

describe('App', () => {
  it('renders a heading', () => {
    // This test will fail if App.tsx doesn't export a component that renders a heading
    // or if App.tsx doesn't exist.
    // The purpose here is to verify the testing setup.
    render(<App />);
    expect(screen.getByText(/Hello, Vitest!/i)).toBeInTheDocument();
  });
});