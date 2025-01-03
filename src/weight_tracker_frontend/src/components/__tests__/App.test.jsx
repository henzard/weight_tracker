import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';

// Mock the hooks
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    principal: null,
    backendActor: null,
    isInitializing: false,
    login: vi.fn(),
    logout: vi.fn()
  })
}));

describe('App', () => {
  it('shows welcome screen when not authenticated', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to Weight Tracker/i)).toBeInTheDocument();
  });
});
