import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserService } from "../../../../webapp/server/services/user.service.js";
import type { User } from "../../../../webapp/shared/types/index.js";

const mockUser: User = {
  id: "1",
  type: "user",
  name: "Test User",
  email: "test@example.com",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockRepo = {
  findAll: vi.fn().mockResolvedValue([mockUser]),
  findById: vi.fn().mockResolvedValue(mockUser),
  create: vi.fn().mockResolvedValue(mockUser),
  update: vi.fn().mockResolvedValue(mockUser),
  delete: vi.fn().mockResolvedValue(undefined),
};

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserService(mockRepo as any);
  });

  it("getAll returns all users", async () => {
    const result = await service.getAll();
    expect(result).toEqual([mockUser]);
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });

  it("getById returns user by id", async () => {
    const result = await service.getById("1");
    expect(result).toEqual(mockUser);
    expect(mockRepo.findById).toHaveBeenCalledWith("1");
  });

  it("create creates a new user", async () => {
    const input = { name: "Test User", email: "test@example.com" };
    const result = await service.create(input);
    expect(result).toEqual(mockUser);
    expect(mockRepo.create).toHaveBeenCalledWith({ ...input, type: "user" });
  });

  it("update updates a user", async () => {
    const input = { name: "Updated User" };
    const result = await service.update("1", input);
    expect(result).toEqual(mockUser);
    expect(mockRepo.update).toHaveBeenCalledWith("1", input);
  });

  it("delete removes a user", async () => {
    await service.delete("1");
    expect(mockRepo.delete).toHaveBeenCalledWith("1");
  });
});
