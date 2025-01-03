import { AuthClient } from '@dfinity/auth-client';
import { createActor } from 'declarations/weight_tracker_backend';
import { canisterId } from 'declarations/weight_tracker_backend/index';

class AuthService {
  constructor() {
    this.authClient = null;
    this.identity = null;
  }

  async initialize() {
    try {
      console.log("Creating auth client");
      this.authClient = await AuthClient.create();
      console.log("Auth client created:", this.authClient);

      const isAuth = await this.authClient.isAuthenticated();
      console.log("Initial auth check:", isAuth);

      if (isAuth) {
        this.identity = this.authClient.getIdentity();
        return this.createActor();
      }
      return null;
    } catch (error) {
      console.error("Error in initAuth:", error);
      throw error;
    }
  }

  async login(onSuccess) {
    console.log("Login attempt with authClient:", this.authClient);
    if (this.authClient) {
      try {
        await this.authClient.login({
          identityProvider: 'https://identity.internetcomputer.org',
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
          onSuccess: async () => {
            this.identity = this.authClient.getIdentity();
            const actor = this.createActor();
            onSuccess(actor);
          },
        });
      } catch (error) {
        console.error("Error during login:", error);
        throw error;
      }
    }
  }

  async logout() {
    console.log("Logout attempt with authClient:", this.authClient);
    if (this.authClient) {
      try {
        await this.authClient.logout();
        console.log("Logout successful");
        return true;
      } catch (error) {
        console.error("Error during logout:", error);
        throw error;
      }
    }
    return false;
  }

  createActor() {
    return createActor(canisterId, {
      agentOptions: {
        host: "https://icp0.io",
        identity: this.identity,
      },
    });
  }

  isAuthenticated() {
    return this.authClient?.isAuthenticated() || false;
  }

  getIdentity() {
    return this.identity;
  }
}

// Create a singleton instance
const authService = new AuthService();
export default authService;