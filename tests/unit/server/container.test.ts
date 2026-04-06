import { beforeEach, describe, expect, it, vi } from "vitest";

const repositoryMethods = vi.hoisted(() => ({
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  findByUserId: vi.fn().mockResolvedValue(null),
  findByMsalIdentity: vi.fn().mockResolvedValue(null),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../../../webapp/server/repositories/user.repository.js", () => ({
  UserRepository: vi.fn().mockImplementation(() => repositoryMethods),
}));

import { serverContainer } from "../../../webapp/server/container.js";
import { UserRepository } from "../../../webapp/server/repositories/user.repository.js";
import { AuthService } from "../../../webapp/server/services/auth.service.js";
import { UserService } from "../../../webapp/server/services/user.service.js";

describe("serverContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves repository and services as singleton bindings", () => {
    expect(serverContainer.get(UserRepository)).toBe(serverContainer.get(UserRepository));
    expect(serverContainer.get(UserService)).toBe(serverContainer.get(UserService));
    expect(serverContainer.get(AuthService)).toBe(serverContainer.get(AuthService));
  });

  it("injects the shared repository into resolved services", async () => {
    const userService = serverContainer.get(UserService);
    const authService = serverContainer.get(AuthService);

    await userService.getById("user-1");
    await authService.getSessionUserById("user-2");

    expect(repositoryMethods.findById).toHaveBeenNthCalledWith(1, "user-1");
    expect(repositoryMethods.findById).toHaveBeenNthCalledWith(2, "user-2");
  });
});
