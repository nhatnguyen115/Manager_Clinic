import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Table } from './Table';
import { Loading } from './Loading';

describe('Table & Loading Components', () => {
    describe('Table', () => {
        const columns = [
            { header: 'Name', accessor: 'name' as const },
            { header: 'Age', accessor: 'age' as const },
            { header: 'Action', accessor: (item: any) => <button>View {item.name}</button> },
        ];
        const data = [
            { id: 1, name: 'John Doe', age: 30 },
            { id: 2, name: 'Jane Smith', age: 25 },
        ];

        it('renders data correctly', () => {
            render(<Table columns={columns} data={data} keyExtractor={(item) => item.id} />);
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('View John Doe')).toBeInTheDocument();
        });

        it('displays empty message when no data', () => {
            render(<Table columns={columns} data={[]} keyExtractor={(item) => item.id} emptyMessage="No users" />);
            expect(screen.getByText('No users')).toBeInTheDocument();
        });

        it('shows loading state', () => {
            render(<Table columns={columns} data={[]} keyExtractor={(item) => item.id} isLoading />);
            expect(screen.getByText(/Loading data.../i)).toBeInTheDocument();
        });
    });

    describe('Loading', () => {
        it('renders spinner with text', () => {
            render(<Loading text="Please wait" />);
            expect(screen.getByText('Please wait')).toBeInTheDocument();
        });

        it('renders full-page overlay', () => {
            const { container } = render(<Loading fullPage />);
            expect(container.firstChild).toHaveClass('fixed');
        });
    });
});
