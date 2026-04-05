import { describe, expect, it } from "vitest";
import { AuthService } from "../../../../webapp/server/services/auth.service.js";
import { UserRepository } from "../../../../webapp/server/repositories/user.repository.js";
import { UserService } from "../../../../webapp/server/services/user.service.js";
import { createServerServiceProvider } from "../../../../webapp/server/lib/service-provider.js";

describe("ServerServiceProvider", () => {
  it("shares the same repository instance across services", () => {
    const provider = createServerServiceProvider();

    const userRepository = provider.getUserRepository();
    const userService = provider.getUserService();
    const authService = provider.getAuthService();

    expect(userRepository).toBeInstanceOf(UserRepository);
    expect(userService).toBeInstanceOf(UserService);
    expect(authService).toBeInstanceOf(AuthService);
    expect(provider.getUserRepository()).toBe(userRepository);
    expect(provider.getUserService()).toBe(userService);
    expect(provider.getAuthService()).toBe(authService);
    expect((userService as { repo: UserRepository }).repo).toBe(userRepository);
    expect((authService as { repo: UserRepository }).repo).toBe(userRepository);
  });
});
