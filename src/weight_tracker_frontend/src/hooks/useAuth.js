import { useState, useEffect } from 'react';
import authService from '../services/AuthService';
import notificationService from '../services/NotificationService';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [backendActor, setBackendActor] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  async function initAuth() {
    try {
      console.log("Initializing auth...");
      const actor = await authService.initialize();
      if (actor) {
        setBackendActor(actor);
        setIsAuthenticated(true);
        try {
          const principal = await actor.whoami();
          setPrincipal(principal.toText());
        } catch (error) {
          console.error("Error fetching principal during init:", error);
        }
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      notificationService.error("Failed to initialize authentication");
    } finally {
      setIsInitializing(false);
    }
  }

  async function login() {
    try {
      await authService.login(async (actor) => {
        setBackendActor(actor);
        setIsAuthenticated(true);
        try {
          const principal = await actor.whoami();
          setPrincipal(principal.toText());
        } catch (error) {
          console.error("Error fetching principal after login:", error);
        }
      });
    } catch (error) {
      console.error("Error during login:", error);
      notificationService.error("Login failed");
    }
  }

  async function logout() {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setPrincipal(null);
      setBackendActor(null);
      setIsInitializing(false);
      window.location.reload();
      notificationService.info('Logged out successfully');
    } catch (error) {
      console.error("Error during logout:", error);
      notificationService.error('Error during logout');
    }
  }

  return {
    isAuthenticated,
    principal,
    backendActor,
    isInitializing,
    login,
    logout
  };
} 