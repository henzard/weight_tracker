import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CollaboratorList from '../CollaboratorList';

describe('CollaboratorList', () => {
  const defaultProps = {
    collaborators: [
      { toText: () => 'collaborator-1' },
      { toText: () => 'collaborator-2' }
    ],
    shareableBatches: [
      { id: 'batch-1', name: 'Batch 1' },
      { id: 'batch-2', name: 'Batch 2' }
    ],
    collaboratorId: '',
    sharingBatchId: '',
    onCollaboratorIdChange: vi.fn(),
    onSharingBatchIdChange: vi.fn(),
    onShare: vi.fn(e => e.preventDefault()),
    onRemoveCollaborator: vi.fn(),
    principal: 'owner-principal',
    batches: [
      {
        batch: {
          id: 'batch-1',
          name: 'Batch 1',
          owner: { toText: () => 'owner-principal' },
          deleted_at: null
        }
      },
      {
        batch: {
          id: 'batch-2',
          name: 'Batch 2',
          owner: { toText: () => 'owner-principal' },
          deleted_at: null
        }
      }
    ],
    hasAccess: vi.fn((collaborator, batchId) => true)
  };

  it('renders the sharing form', () => {
    render(<CollaboratorList {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Share Batch')).toBeInTheDocument();
  });

  it('handles collaborator ID input', () => {
    render(<CollaboratorList {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new-collaborator' } });
    expect(defaultProps.onCollaboratorIdChange).toHaveBeenCalledWith('new-collaborator');
  });

  it('handles batch selection', () => {
    render(<CollaboratorList {...defaultProps} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'batch-1' } });
    expect(defaultProps.onSharingBatchIdChange).toHaveBeenCalledWith('batch-1');
  });

  it('handles form submission', () => {
    render(<CollaboratorList {...defaultProps} />);
    const form = screen.getByTestId('share-form');
    fireEvent.submit(form);
    expect(defaultProps.onShare).toHaveBeenCalled();
  });

  it('renders collaborator list when collaborators exist', () => {
    render(<CollaboratorList {...defaultProps} />);
    expect(screen.getByText('Current Collaborators:')).toBeInTheDocument();
    expect(screen.getByText('collaborator-1')).toBeInTheDocument();
    expect(screen.getByText('collaborator-2')).toBeInTheDocument();
  });

  it('handles collaborator removal', () => {
    render(<CollaboratorList {...defaultProps} />);
    const removeButtons = screen.getAllByRole('button');
    const removeButton = removeButtons.find(btn => btn.classList.contains('btn-danger'));
    fireEvent.click(removeButton);
    expect(defaultProps.onRemoveCollaborator).toHaveBeenCalledWith('collaborator-1');
  });

  it('shows shared batches for each collaborator', () => {
    render(<CollaboratorList {...defaultProps} />);
    const badges = screen.getAllByTestId('batch-badge');
    expect(badges.some(badge => badge.textContent === 'Batch 1')).toBe(true);
    expect(badges.some(badge => badge.textContent === 'Batch 2')).toBe(true);
  });

  it('does not show collaborator list when empty', () => {
    render(<CollaboratorList {...defaultProps} collaborators={[]} />);
    expect(screen.queryByText('Current Collaborators:')).not.toBeInTheDocument();
  });

  it('filters out deleted batches from shared batches display', () => {
    const propsWithDeletedBatch = {
      ...defaultProps,
      batches: [
        {
          batch: {
            id: 'batch-1',
            name: 'Batch 1',
            owner: { toText: () => 'owner-principal' },
            deleted_at: ['some-timestamp']
          }
        }
      ]
    };
    render(<CollaboratorList {...propsWithDeletedBatch} />);
    const badges = screen.queryAllByTestId('batch-badge');
    expect(badges.every(badge => badge.textContent !== 'Batch 1')).toBe(true);
  });
}); 