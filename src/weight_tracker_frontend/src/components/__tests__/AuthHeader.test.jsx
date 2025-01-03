import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthHeader from '../AuthHeader';

describe('AuthHeader', () => {
  const defaultProps = {
    isAuthenticated: true,
    principal: 'test-principal',
    onLogout: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user info when authenticated', () => {
    render(<AuthHeader {...defaultProps} />);
    expect(screen.getByText(/test-principal/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('handles logout click', () => {
    render(<AuthHeader {...defaultProps} />);
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });

  it('shows login button when not authenticated', () => {
    render(<AuthHeader {...defaultProps} isAuthenticated={false} />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('displays principal ID', () => {
    const longPrincipal = '1234567890abcdef1234567890abcdef';
    render(<AuthHeader {...defaultProps} principal={longPrincipal} />);
    expect(screen.getByText(longPrincipal)).toBeInTheDocument();
  });

  it('shows clickable principal ID for copying', () => {
    render(<AuthHeader {...defaultProps} />);
    const copySpan = screen.getByTitle('Click to copy Principal ID');
    expect(copySpan).toBeInTheDocument();
    expect(copySpan).toHaveStyle({ cursor: 'pointer' });
  });
}); 