import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import WeightTable from '../WeightTable';

describe('WeightTable', () => {
  const defaultProps = {
    weights: [
      {
        item_id: 'item-1',
        weight: 75.5,
        created_at: BigInt(Date.now()),
        deleted_at: [],
        owner: { toText: () => 'owner-id' }
      },
      {
        item_id: 'item-2',
        weight: 82.3,
        created_at: BigInt(Date.now()),
        deleted_at: [],
        owner: { toText: () => 'owner-id' }
      }
    ],
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    editingWeight: null,
    onEditSubmit: vi.fn(),
    onEditCancel: vi.fn(),
    includeDeleted: false,
    onIncludeDeletedChange: vi.fn(),
    principal: 'owner-id',
    onRowClick: vi.fn(),
    filterText: '',
    onFilterTextChange: vi.fn(),
    onClearBatchSelection: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders weight table with data', () => {
    render(<WeightTable {...defaultProps} />);
    const table = screen.getByRole('table');
    expect(screen.getByText('75.50')).toBeInTheDocument();
    expect(screen.getByText('82.30')).toBeInTheDocument();
  });

  it('toggles deleted weights visibility', () => {
    render(<WeightTable {...defaultProps} />);
    const checkbox = screen.getByLabelText('Show Deleted Records');
    
    fireEvent.click(checkbox);
    expect(defaultProps.onIncludeDeletedChange).toHaveBeenCalledWith(true);
  });

  it('shows deleted status for deleted weights', () => {
    const deletedWeight = {
      ...defaultProps.weights[0],
      deleted_at: [BigInt(Date.now())],
      owner: { toText: () => 'owner-id' }
    };
    render(<WeightTable {...defaultProps} weights={[deletedWeight]} includeDeleted={true} />);
    expect(screen.getByText('Deleted')).toBeInTheDocument();
  });

  it('sorts weights by clicking column headers', async () => {
    render(<WeightTable {...defaultProps} />);
    const idHeader = screen.getByRole('columnheader', { name: /item id/i });
    
    fireEvent.click(idHeader);
    expect(screen.getByText('item-1')).toBeInTheDocument();
    
    fireEvent.click(idHeader);
    expect(screen.getByText('item-2')).toBeInTheDocument();
  });

  it('handles empty weights array', () => {
    render(<WeightTable {...defaultProps} weights={[]} />);
    expect(screen.getByText('There are no records to display')).toBeInTheDocument();
  });
}); 