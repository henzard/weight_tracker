import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuickGuide from '../QuickGuide';

describe('QuickGuide', () => {
  it('renders all guide steps', () => {
    render(<QuickGuide />);
    
    expect(screen.getByText(/create a batch/i)).toBeInTheDocument();
    expect(screen.getByText(/select a batch/i)).toBeInTheDocument();
    expect(screen.getByText(/enter the item id/i)).toBeInTheDocument();
    expect(screen.getByText(/view and manage/i)).toBeInTheDocument();
    expect(screen.getByText(/share batches/i)).toBeInTheDocument();
  });

  it('renders as a collapsible card', () => {
    render(<QuickGuide />);
    expect(screen.getByText('Quick Guide').closest('.card')).toBeInTheDocument();
  });

  it('starts collapsed by default', () => {
    render(<QuickGuide />);
    const content = screen.getByRole('list').closest('.collapse');
    expect(content).not.toHaveClass('show');
  });
}); 