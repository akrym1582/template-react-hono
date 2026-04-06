import { describe, expect, it } from "vitest";
import { serverContainer } from "../../../webapp/server/container.js";
import { UserRepository } from "../../../webapp/server/repositories/user.repository.js";
import { AuthService } from "../../../webapp/server/services/auth.service.js";
import { UserService } from "../../../webapp/server/services/user.service.js";

describe("serverContainer", () => {
  it("injects the same user repository into server services", () => {
    const userRepository = serverContainer.get(UserRepository);
    const userService = serverContainer.get(UserService) as UserService & {
      repo: UserRepository;
    };
    const authService = serverContainer.get(AuthService) as AuthService & {
      repo: UserRepository;
    };

    expect(userService).toBeInstanceOf(UserService);
    expect(authService).toBeInstanceOf(AuthService);
    expect(userService.repo).toBe(userRepository);
    expect(authService.repo).toBe(userRepository);
  });
});
