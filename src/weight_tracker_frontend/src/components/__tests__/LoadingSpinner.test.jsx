import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Custom loading message" />);
    expect(screen.getByText('Custom loading message', { selector: '.visually-hidden' })).toBeInTheDocument();
  });

  it('applies spinner animation class', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toHaveClass('spinner-border');
  });
}); 