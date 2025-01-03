import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BatchList from '../BatchList';

describe('BatchList', () => {
  const defaultProps = {
    batches: [
      {
        batch: {
          id: 'batch-1',
          name: 'Test Batch 1',
          description: 'Description 1',
          owner: { toText: () => 'owner-id' },
          created_at: Date.now(),
          deleted_at: []
        },
        stats: { count: 5 }
      },
      {
        batch: {
          id: 'batch-2',
          name: 'Test Batch 2',
          description: 'Description 2',
          owner: { toText: () => 'owner-id' },
          created_at: Date.now(),
          deleted_at: []
        },
        stats: { count: 3 }
      }
    ],
    selectedBatch: null,
    principal: 'owner-id',
    onBatchSelect: vi.fn(),
    onBatchDelete: vi.fn(),
    onCreateBatchClick: vi.fn(),
    showBatchForm: false,
    batchName: '',
    batchDescription: '',
    onNameChange: vi.fn(),
    onDescriptionChange: vi.fn(),
    onSubmit: vi.fn(),
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list of batches', () => {
    render(<BatchList {...defaultProps} />);
    expect(screen.getByText('Test Batch 1')).toBeInTheDocument();
    expect(screen.getByText('Test Batch 2')).toBeInTheDocument();
  });

  it('shows batch form when showBatchForm is true', () => {
    render(<BatchList {...defaultProps} showBatchForm={true} />);
    expect(screen.getByPlaceholderText('Enter batch name')).toBeInTheDocument();
  });

  it('calls onBatchSelect when a batch is clicked', () => {
    render(<BatchList {...defaultProps} />);
    fireEvent.click(screen.getByText('Test Batch 1'));
    expect(defaultProps.onBatchSelect).toHaveBeenCalledWith(defaultProps.batches[0]);
  });

  it('calls onBatchDelete when delete button is clicked', () => {
    render(<BatchList {...defaultProps} />);
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.onBatchDelete).toHaveBeenCalledWith('batch-1');
  });

  it('toggles new batch form when create button is clicked', () => {
    render(<BatchList {...defaultProps} />);
    const createButton = screen.getByRole('button', { name: /new batch/i });
    fireEvent.click(createButton);
    expect(defaultProps.onCreateBatchClick).toHaveBeenCalled();
  });

  it('shows selected state for selected batch', () => {
    render(<BatchList {...defaultProps} selectedBatch={defaultProps.batches[0].batch} />);
    const selectedBatch = screen.getByText('Test Batch 1').closest('[data-testid="batch-card"]');
    expect(selectedBatch).toHaveClass('border-primary');
  });

  it('handles batch form submission', () => {
    render(<BatchList {...defaultProps} showBatchForm={true} />);
    const form = screen.getByTestId('batch-form');
    fireEvent.submit(form);
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it('handles empty batches list', () => {
    render(<BatchList {...defaultProps} batches={[]} />);
    const emptyRow = screen.getByRole('row', { name: /no batches found/i });
    expect(emptyRow).toBeInTheDocument();
  });
}); 