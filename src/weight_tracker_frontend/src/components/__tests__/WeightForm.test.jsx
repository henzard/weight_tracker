import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeightForm from '../WeightForm';

describe('WeightForm', () => {
  const mockProps = {
    selectedBatch: null,
    itemId: '',
    weight: '',
    onItemIdChange: vi.fn(),
    onWeightChange: vi.fn(),
    onSubmit: vi.fn(),
    onClearBatch: vi.fn(),
  };

  it('shows warning when no batch is selected', () => {
    render(<WeightForm {...mockProps} />);
    expect(screen.getByText(/please select a batch first/i)).toBeInTheDocument();
  });

  it('shows form when batch is selected', () => {
    const props = {
      ...mockProps,
      selectedBatch: { id: '1', name: 'Test Batch' }
    };
    render(<WeightForm {...props} />);
    expect(screen.getByLabelText(/item id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weight/i)).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', () => {
    const props = {
      ...mockProps,
      selectedBatch: { id: '1', name: 'Test Batch' }
    };
    render(<WeightForm {...props} />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    expect(props.onSubmit).toHaveBeenCalled();
  });

  it('updates input values when changed', () => {
    const props = {
      ...mockProps,
      selectedBatch: { id: '1', name: 'Test Batch' }
    };
    render(<WeightForm {...props} />);
    
    const itemIdInput = screen.getByLabelText(/item id/i);
    fireEvent.change(itemIdInput, { target: { value: 'TEST001' } });
    expect(props.onItemIdChange).toHaveBeenCalledWith('TEST001');

    const weightInput = screen.getByLabelText(/weight/i);
    fireEvent.change(weightInput, { target: { value: '75.5' } });
    expect(props.onWeightChange).toHaveBeenCalledWith('75.5');
  });
}); 