import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Jumbotron from '../Jumbotron';

describe('Jumbotron', () => {
  it('renders the title correctly', () => {
    render(<Jumbotron />);
    expect(screen.getByText('Weight Tracker')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<Jumbotron />);
    expect(screen.getByText(/Track, manage, and analyze weights efficiently/)).toBeInTheDocument();
  });

  it('includes the weight icon', () => {
    const { container } = render(<Jumbotron />);
    const icon = container.querySelector('.fas.fa-weight');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('fas', 'fa-weight', 'me-3');
  });

  it('has the correct styling classes', () => {
    const { container } = render(<Jumbotron />);
    const jumbotron = container.firstChild;
    expect(jumbotron).toHaveClass('p-5', 'mb-4', 'bg-light', 'rounded-3');
  });
}); 