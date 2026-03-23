import { render, screen } from '@testing-library/react';
import { GlassButton } from './GlassButton';
import { describe, it, expect } from 'vitest';

describe('GlassButton', () => {
    it('renders correctly', () => {
        render(<GlassButton>Click me</GlassButton>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('shows loading state', () => {
        render(<GlassButton isLoading>Click me</GlassButton>);
        expect(screen.getByRole('button')).toBeDisabled();
        // Check for spinner or just disabled state
    });

    it('applies variant classes', () => {
        const { container } = render(<GlassButton variant="primary">Primary</GlassButton>);
        expect(container.firstChild).toHaveClass('bg-orange-500');
    });
});
