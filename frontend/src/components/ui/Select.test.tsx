import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from './Select';

const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3', disabled: true },
];

describe('Select Component', () => {
    it('renders correctly with options', () => {
        render(<Select label="Choice" options={options} />);
        expect(screen.getByText('Choice')).toBeInTheDocument();
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('displays placeholder', () => {
        render(<Select options={options} placeholder="Pick one" />);
        expect(screen.getByText('Pick one')).toBeInTheDocument();
    });

    it('calls onChange when selection changes', () => {
        const handleChange = vi.fn();
        render(<Select options={options} onChange={handleChange} />);
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '2' } });
        expect(handleChange).toHaveBeenCalled();
        expect(select).toHaveValue('2');
    });

    it('displays error and applies error classes', () => {
        render(<Select options={options} error="Selection required" />);
        expect(screen.getByText('Selection required')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toHaveClass('border-error');
    });

    it('is disabled when disabled prop is true', () => {
        render(<Select options={options} disabled />);
        expect(screen.getByRole('combobox')).toBeDisabled();
    });
});
