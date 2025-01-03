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
    principal: 'owner-id'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders weight table with data', () => {
    render(<WeightTable {...defaultProps} />);
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows.length).toBe(3); // Header + 2 data rows
    expect(within(rows[1]).getByText('75.50')).toBeInTheDocument();
    expect(within(rows[2]).getByText('82.30')).toBeInTheDocument();
  });

  it('handles weight deletion', () => {
    render(<WeightTable {...defaultProps} />);
    const table = screen.getByRole('table');
    const firstRow = within(table).getAllByRole('row')[1];
    const deleteButton = within(firstRow).getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith('item-1', defaultProps.weights[0].created_at);
  });

  it('enters edit mode when edit button is clicked', () => {
    render(<WeightTable {...defaultProps} />);
    const table = screen.getByRole('table');
    const firstRow = within(table).getAllByRole('row')[1];
    const editButton = within(firstRow).getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(defaultProps.weights[0]);
  });

  it('shows edit form for editing weight', () => {
    const editingWeight = defaultProps.weights[0];
    render(<WeightTable {...defaultProps} editingWeight={editingWeight} />);
    
    const weightInput = screen.getByRole('spinbutton');
    expect(weightInput).toHaveValue(75.5);
    
    fireEvent.change(weightInput, { target: { value: '80.5' } });
    fireEvent.submit(screen.getByTestId('edit-form'));
    
    expect(defaultProps.onEditSubmit).toHaveBeenCalledWith('80.5');
  });

  it('cancels editing when cancel button is clicked', () => {
    const editingWeight = defaultProps.weights[0];
    render(<WeightTable {...defaultProps} editingWeight={editingWeight} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(defaultProps.onEditCancel).toHaveBeenCalled();
  });

  it('toggles deleted weights visibility', () => {
    render(<WeightTable {...defaultProps} />);
    const checkbox = screen.getByRole('checkbox', { name: /show deleted records/i });
    
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
    const table = screen.getByRole('table');
    const firstRow = within(table).getAllByRole('row')[1];
    expect(within(firstRow).getByText(/deleted/i)).toBeInTheDocument();
  });

  it('sorts weights by clicking column headers', async () => {
    render(<WeightTable {...defaultProps} />);
    const table = screen.getByRole('table');
    const header = within(table).getByRole('columnheader', { name: /item id/i });
    
    fireEvent.click(header);
    const rows = within(table).getAllByRole('row');
    expect(within(rows[1]).getByText('item-1')).toBeInTheDocument();
    
    fireEvent.click(header);
    const rowsAfterSort = within(table).getAllByRole('row');
    expect(within(rowsAfterSort[1]).getByText('item-2')).toBeInTheDocument();
  });

  it('handles empty weights array', () => {
    render(<WeightTable {...defaultProps} weights={[]} />);
    expect(screen.getByText('There are no records to display')).toBeInTheDocument();
  });
}); 