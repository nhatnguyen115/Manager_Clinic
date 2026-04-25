import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal Component', () => {
    it('does not render when isOpen is false', () => {
        const { queryByRole } = render(
            <Modal isOpen={false} onClose={() => { }}>
                Modal Content
            </Modal>
        );
        expect(queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders correctly when isOpen is true', () => {
        render(
            <Modal isOpen={true} onClose={() => { }}>
                Modal Content
            </Modal>
        );
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const handleClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={handleClose} title="Test Modal">
                Content
            </Modal>
        );
        fireEvent.click(screen.getByLabelText('Close'));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', () => {
        const handleClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={handleClose}>
                Content
            </Modal>
        );
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(handleClose).toHaveBeenCalled();
    });

    it('renders footer content correctly', () => {
        render(
            <Modal isOpen={true} onClose={() => { }} footer={<button>Save</button>}>
                Content
            </Modal>
        );
        expect(screen.getByText('Save')).toBeInTheDocument();
    });
});
