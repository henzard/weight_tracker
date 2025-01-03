import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CollapsibleCard from '../CollapsibleCard';

describe('CollapsibleCard', () => {
  const defaultProps = {
    title: 'Test Card',
    icon: 'fas fa-test',
    children: <div>Test Content</div>,
    headerClassName: 'bg-primary',
    defaultExpanded: true
  };

  it('renders with title and icon', () => {
    render(<CollapsibleCard {...defaultProps} />);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(document.querySelector('.fas.fa-test')).toBeInTheDocument();
  });

  it('toggles content visibility when header is clicked', () => {
    render(<CollapsibleCard {...defaultProps} />);
    const header = screen.getByText('Test Card').closest('[role="button"]');
    const content = screen.getByText('Test Content').closest('.collapse');
    
    // Content should be visible initially (defaultExpanded = true)
    expect(content).toHaveClass('show');
    
    // Click to collapse
    fireEvent.click(header);
    expect(content).not.toHaveClass('show');
    
    // Click to expand
    fireEvent.click(header);
    expect(content).toHaveClass('show');
  });

  it('renders with header actions', () => {
    const headerActions = <button>Action</button>;
    render(<CollapsibleCard {...defaultProps} headerActions={headerActions} />);
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('starts collapsed when defaultExpanded is false', () => {
    render(<CollapsibleCard {...defaultProps} defaultExpanded={false} />);
    const content = screen.getByText('Test Content').closest('.collapse');
    expect(content).not.toHaveClass('show');
  });
}); 