import { describe, expect, it, vi } from "vitest";

const {
  userRepositoryInstance,
  userServiceInstance,
  authServiceInstance,
  UserRepository,
  UserService,
  AuthService,
} = vi.hoisted(() => {
  const userRepositoryInstance = { kind: "user-repository" };
  const userServiceInstance = { kind: "user-service" };
  const authServiceInstance = { kind: "auth-service" };

  return {
    userRepositoryInstance,
    userServiceInstance,
    authServiceInstance,
    UserRepository: vi.fn().mockImplementation(() => userRepositoryInstance),
    UserService: vi.fn().mockImplementation(() => userServiceInstance),
    AuthService: vi.fn().mockImplementation(() => authServiceInstance),
  };
});

vi.mock("../../../../webapp/server/repositories/user.repository.js", () => ({
  UserRepository,
}));

vi.mock("../../../../webapp/server/services/user.service.js", () => ({
  UserService,
}));

vi.mock("../../../../webapp/server/services/auth.service.js", () => ({
  AuthService,
}));

import { createServerServiceProvider } from "../../../../webapp/server/lib/service-provider.js";

describe("ServerServiceProvider", () => {
  it("reuses the same repository instance when constructing services", () => {
    const provider = createServerServiceProvider();

    expect(provider.getUserRepository()).toBe(userRepositoryInstance);
    expect(provider.getUserService()).toBe(userServiceInstance);
    expect(provider.getAuthService()).toBe(authServiceInstance);

    expect(provider.getUserRepository()).toBe(userRepositoryInstance);
    expect(provider.getUserService()).toBe(userServiceInstance);
    expect(provider.getAuthService()).toBe(authServiceInstance);

    expect(UserRepository).toHaveBeenCalledTimes(1);
    expect(UserService).toHaveBeenCalledTimes(1);
    expect(AuthService).toHaveBeenCalledTimes(1);
    expect(UserService).toHaveBeenCalledWith(userRepositoryInstance);
    expect(AuthService).toHaveBeenCalledWith(userRepositoryInstance);
  });
});
