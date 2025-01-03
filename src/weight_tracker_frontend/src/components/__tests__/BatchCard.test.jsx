import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BatchCard from '../BatchCard';

describe('BatchCard', () => {
  const defaultProps = {
    batch: {
      id: 'batch-1',
      name: 'Test Batch',
      description: 'Test Description',
      owner: { toText: () => 'owner-id' },
      created_at: Date.now(),
      deleted_at: null
    },
    stats: {
      count: 5,
      min_weight: 50.0,
      max_weight: 100.0,
      average_weight: 75.0
    },
    isSelected: false,
    isOwner: true,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
    disabled: false
  };

  it('renders batch details correctly', () => {
    render(<BatchCard {...defaultProps} />);
    
    expect(screen.getByText('Test Batch')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Count
    expect(screen.getByText('50.00 kg')).toBeInTheDocument(); // Min weight
    expect(screen.getByText('100.00 kg')).toBeInTheDocument(); // Max weight
    expect(screen.getByText('75.00 kg')).toBeInTheDocument(); // Average weight
  });

  it('applies selected styles when isSelected is true', () => {
    render(<BatchCard {...defaultProps} isSelected={true} />);
    expect(screen.getByTestId('batch-card')).toHaveClass('border-primary');
  });

  it('calls onSelect when clicked', () => {
    render(<BatchCard {...defaultProps} />);
    fireEvent.click(screen.getByTestId('batch-card'));
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows delete button only for owner', () => {
    const { rerender } = render(<BatchCard {...defaultProps} />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();

    rerender(<BatchCard {...defaultProps} isOwner={false} />);
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<BatchCard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('disables interactions when disabled prop is true', () => {
    render(<BatchCard {...defaultProps} disabled={true} />);
    const card = screen.getByTestId('batch-card');
    
    expect(card).toHaveClass('disabled');
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    
    // Test select button is disabled
    const selectButton = screen.getByRole('button', { name: /select/i });
    expect(selectButton).toBeDisabled();
  });

  it('shows no stats message when count is 0', () => {
    render(<BatchCard {...defaultProps} stats={{ count: 0 }} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
}); 