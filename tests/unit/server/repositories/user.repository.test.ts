import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../../../../webapp/shared/types/index.js";

async function importUserRepositoryModule() {
  vi.resetModules();

  const mockTableClient = {
    listEntities: vi.fn(),
    getEntity: vi.fn(),
    createEntity: vi.fn(),
    updateEntity: vi.fn(),
    deleteEntity: vi.fn(),
  };
  const getTableClient = vi.fn().mockReturnValue(mockTableClient);

  vi.doMock("../../../../webapp/server/repositories/table.js", () => ({
    getTableClient,
  }));
  vi.doMock("../../../../webapp/server/lib/env.js", () => ({
    env: {
      USER_TABLE_NAME: "Users",
    },
  }));

  const module = await import("../../../../webapp/server/repositories/user.repository.js");
  return {
    UserRepository: module.UserRepository,
    mockTableClient,
    getTableClient,
  };
}

const baseUser: Omit<User, "id" | "createdAt" | "updatedAt"> = {
  type: "user",
  name: "Template User",
  email: "user@example.com",
  userId: "user@example.com",
  displayName: "Template User",
  hasLocalPassword: false,
  roles: ["admin", "viewer"],
  isActive: true,
  sessionVersion: 2,
};

describe("UserRepository", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("serializes roles as JSON when creating a table entity", async () => {
    const randomUUIDSpy = vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("user-1");
    const { UserRepository, mockTableClient, getTableClient } =
      await importUserRepositoryModule();
    const repo = new UserRepository();

    await repo.create(baseUser);

    expect(getTableClient).toHaveBeenCalledWith("Users");
    expect(mockTableClient.createEntity).toHaveBeenCalledWith(
      expect.objectContaining({
        partitionKey: "USER",
        rowKey: "user-1",
        rolesJson: JSON.stringify(baseUser.roles),
      })
    );
    randomUUIDSpy.mockRestore();
  });

  it("parses roles JSON when loading a user from Azure Table Storage", async () => {
    const { UserRepository, mockTableClient } = await importUserRepositoryModule();
    const repo = new UserRepository();
    mockTableClient.getEntity.mockResolvedValue({
      partitionKey: "USER",
      rowKey: "user-1",
      type: "user",
      name: "Template User",
      email: "user@example.com",
      userId: "user@example.com",
      displayName: "Template User",
      hasLocalPassword: false,
      rolesJson: JSON.stringify(["viewer"]),
      isActive: true,
      sessionVersion: 1,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });

    await expect(repo.findById("user-1")).resolves.toEqual(
      expect.objectContaining({
        id: "user-1",
        roles: ["viewer"],
      })
    );
  });
});
