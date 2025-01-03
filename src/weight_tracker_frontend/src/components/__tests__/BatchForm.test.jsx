import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BatchForm from '../BatchForm';

describe('BatchForm', () => {
  const defaultProps = {
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

  it('renders form inputs correctly', () => {
    render(<BatchForm {...defaultProps} />);
    
    expect(screen.getByText('Batch Name')).toBeInTheDocument();
    expect(screen.getByText('Description (Optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('updates input values when changed', () => {
    render(<BatchForm {...defaultProps} />);
    
    const nameInput = screen.getByPlaceholderText('Enter batch name');
    fireEvent.change(nameInput, { target: { value: 'New Batch' } });
    expect(defaultProps.onNameChange).toHaveBeenCalledWith('New Batch');

    const descInput = screen.getByPlaceholderText('Enter batch description');
    fireEvent.change(descInput, { target: { value: 'Test Description' } });
    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith('Test Description');
  });

  it('calls onSubmit when form is submitted', () => {
    render(<BatchForm {...defaultProps} batchName="Test" />);
    const form = screen.getByTestId('batch-form');
    fireEvent.submit(form);
    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<BatchForm {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });
}); 