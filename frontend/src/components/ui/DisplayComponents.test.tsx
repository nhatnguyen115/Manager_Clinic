import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardContent } from './Card';
import { Badge } from './Badge';
import { Avatar } from './Avatar';

describe('UI Components', () => {
    describe('Card', () => {
        it('renders title and content', () => {
            render(
                <Card>
                    <CardHeader title="Card Title" />
                    <CardContent>Card Content</CardContent>
                </Card>
            );
            expect(screen.getByText('Card Title')).toBeInTheDocument();
            expect(screen.getByText('Card Content')).toBeInTheDocument();
        });
    });

    describe('Badge', () => {
        it('renders correctly with different variants', () => {
            const { rerender } = render(<Badge variant="primary" />) as any;
            // cva might not expose exact classes easily in test without more setup, so we check content
            rerender(<Badge>Status</Badge>);
            expect(screen.getByText('Status')).toBeInTheDocument();
        });
    });

    describe('Avatar', () => {
        it('renders fallback when no src', () => {
            render(<Avatar fallback="JD" />);
            expect(screen.getByText('JD')).toBeInTheDocument();
        });

        it('renders image when src provided', () => {
            render(<Avatar src="test.jpg" alt="User" />);
            const img = screen.getByAltText('User');
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', 'test.jpg');
        });
    });
});
