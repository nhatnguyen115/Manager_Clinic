import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input Component', () => {
    it('renders correctly with label', () => {
        render(<Input label="Username" placeholder="Enter username" />);
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    });

    it('displays error message and applies error classes', () => {
        render(<Input error="Field is required" />);
        expect(screen.getByText('Field is required')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveClass('border-error');
    });

    it('displays helper text', () => {
        render(<Input helperText="Min 8 characters" />);
        expect(screen.getByText('Min 8 characters')).toBeInTheDocument();
    });

    it('calls onChange when typing', () => {
        const handleChange = vi.fn();
        render(<Input onChange={handleChange} />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'test' } });
        expect(handleChange).toHaveBeenCalled();
    });

    it('is disabled when disabled prop is true', () => {
        render(<Input disabled />);
        expect(screen.getByRole('textbox')).toBeDisabled();
    });
});
