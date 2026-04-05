import type { User } from "../../shared/types/index.js";
import type { CreateUserInput, UpdateUserInput } from "../../shared/validators/index.js";
import { UserRepository } from "../repositories/user.repository.js";

export class UserService {
  private readonly repo: UserRepository;

  constructor(repo?: UserRepository) {
    this.repo = repo ?? new UserRepository();
  }

  async getAll(): Promise<User[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<User | null> {
    return this.repo.findById(id);
  }

  async create(data: CreateUserInput): Promise<User> {
    return this.repo.create({ ...data, type: "user" });
  }

  async update(id: string, data: UpdateUserInput): Promise<User | null> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
