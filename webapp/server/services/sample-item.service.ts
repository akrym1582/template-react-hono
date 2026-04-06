import type { SampleItem, SearchPage } from "../../shared/types/index.js";
import type {
  CreateSampleItemInput,
  SampleItemSearchInput,
  UpdateSampleItemInput,
} from "../../shared/validators/index.js";
import { SampleItemRepository } from "../repositories/sample-item.repository.js";

export class SampleItemService {
  private readonly repo: SampleItemRepository;

  constructor(repo?: SampleItemRepository) {
    this.repo = repo ?? new SampleItemRepository();
  }

  async search(input: SampleItemSearchInput): Promise<SearchPage<SampleItem>> {
    return this.repo.search(input);
  }

  streamSearch(input: SampleItemSearchInput) {
    return this.repo.streamSearch(input);
  }

  async getById(id: string): Promise<SampleItem | null> {
    return this.repo.findById(id);
  }

  async create(input: CreateSampleItemInput): Promise<SampleItem> {
    return this.repo.create(input);
  }

  async update(id: string, input: UpdateSampleItemInput): Promise<SampleItem | null> {
    return this.repo.update(id, input);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
