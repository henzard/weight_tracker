import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeScreen from '../WelcomeScreen';

describe('WelcomeScreen', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    mockLogin.mockClear();
  });

  it('renders welcome message and features', () => {
    render(<WelcomeScreen onLogin={mockLogin} />);
    
    // Check main content
    expect(screen.getByText(/Welcome to Weight Tracker/i)).toBeInTheDocument();
    
    // Check feature cards
    expect(screen.getByText(/Versatile/i)).toBeInTheDocument();
    expect(screen.getByText(/Collaborative/i)).toBeInTheDocument();
    expect(screen.getByText(/Insightful/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-time/i)).toBeInTheDocument();
  });

  it('calls onLogin when login button is clicked', () => {
    render(<WelcomeScreen onLogin={mockLogin} />);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it('renders all feature cards with icons', () => {
    render(<WelcomeScreen onLogin={mockLogin} />);
    
    const featureCards = screen.getAllByTestId('feature-card');
    expect(featureCards).toHaveLength(4);
    
    featureCards.forEach(card => {
      expect(card.querySelector('.feature-icon')).toBeInTheDocument();
    });
  });
}); 