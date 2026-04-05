import type { User } from "../../shared/types/index.js";
import { getContainer } from "./cosmos.js";

export class UserRepository {
  async findAll(): Promise<User[]> {
    const container = getContainer();
    const { resources } = await container.items
      .query<User>("SELECT * FROM c WHERE c.type = 'user'")
      .fetchAll();
    return resources;
  }

  async findById(id: string): Promise<User | null> {
    const container = getContainer();
    const { resource } = await container.item(id, id).read<User>();
    return resource ?? null;
  }

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const container = getContainer();
    const user: User = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const { resource } = await container.items.create<User>(user);
    return resource!;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    const container = getContainer();
    const updated: User = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    const { resource } = await container.item(id, id).replace<User>(updated);
    return resource ?? null;
  }

  async delete(id: string): Promise<void> {
    const container = getContainer();
    await container.item(id, id).delete();
  }
}
