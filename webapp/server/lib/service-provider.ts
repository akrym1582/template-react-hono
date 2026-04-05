import { UserRepository } from "../repositories/user.repository.js";
import { AuthService } from "../services/auth.service.js";
import { UserService } from "../services/user.service.js";

export interface ServerServiceProvider {
  getUserRepository(): UserRepository;
  getUserService(): UserService;
  getAuthService(): AuthService;
}

export type ServiceProviderVariables = {
  Variables: {
    serviceProvider: ServerServiceProvider;
  };
};

class DefaultServerServiceProvider implements ServerServiceProvider {
  private userRepository?: UserRepository;
  private userService?: UserService;
  private authService?: AuthService;

  getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository();
    }
    return this.userRepository;
  }

  getUserService(): UserService {
    if (!this.userService) {
      this.userService = new UserService(this.getUserRepository());
    }
    return this.userService;
  }

  getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = new AuthService(this.getUserRepository());
    }
    return this.authService;
  }
}

export function createServerServiceProvider(): ServerServiceProvider {
  return new DefaultServerServiceProvider();
}
