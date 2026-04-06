import type { SqlQuerySpec } from "@azure/cosmos";
import type { SampleItem, SearchPage } from "../../shared/types/index.js";
import type { CreateSampleItemInput, SampleItemSearchInput, UpdateSampleItemInput } from "../../shared/validators/index.js";
import { getContainer } from "./cosmos.js";

function buildSearchQuery(
  input: Pick<SampleItemSearchInput, "keyword" | "category">,
  includePaging: boolean
): SqlQuerySpec {
  const conditions = ["c.type = 'sampleItem'"];
  const parameters: Array<{ name: string; value: string | number }> = [];

  if (input.keyword) {
    conditions.push(
      "(CONTAINS(LOWER(c.code), @keyword) OR CONTAINS(LOWER(c.name), @keyword) OR (IS_DEFINED(c.description) AND CONTAINS(LOWER(c.description), @keyword)))"
    );
    parameters.push({ name: "@keyword", value: input.keyword.toLowerCase() });
  }

  if (input.category) {
    conditions.push("CONTAINS(LOWER(c.category), @category)");
    parameters.push({ name: "@category", value: input.category.toLowerCase() });
  }

  return {
    query: `SELECT * FROM c WHERE ${conditions.join(" AND ")} ORDER BY c.updatedAt DESC, c.id ASC${
      includePaging ? " OFFSET @offset LIMIT @limit" : ""
    }`,
    parameters,
  };
}

export class SampleItemRepository {
  async search(input: SampleItemSearchInput): Promise<SearchPage<SampleItem>> {
    const container = getContainer();
    const limit = input.limit ?? 20;
    const offset = Number(input.cursor ?? "0");
    const query = buildSearchQuery(input, true);
    (query.parameters ??= []).push(
      { name: "@offset", value: offset },
      { name: "@limit", value: limit }
    );

    const { resources } = await container.items.query<SampleItem>(query).fetchAll();

    return {
      items: resources,
      nextCursor: resources.length === limit ? String(offset + limit) : null,
    };
  }

  async *streamSearch(input: SampleItemSearchInput): AsyncGenerator<SampleItem> {
    const container = getContainer();
    const iterator = container.items.query<SampleItem>(buildSearchQuery(input, false));

    while (iterator.hasMoreResults()) {
      const { resources } = await iterator.fetchNext();
      for (const item of resources) {
        yield item;
      }
    }
  }

  async findById(id: string): Promise<SampleItem | null> {
    const container = getContainer();
    const { resource } = await container.item(id, id).read<SampleItem>();
    return resource ?? null;
  }

  async create(input: CreateSampleItemInput): Promise<SampleItem> {
    const container = getContainer();
    const now = new Date().toISOString();
    const sampleItem: SampleItem = {
      ...input,
      description: input.description || undefined,
      id: crypto.randomUUID(),
      type: "sampleItem",
      createdAt: now,
      updatedAt: now,
    };

    const { resource } = await container.items.create<SampleItem>(sampleItem);
    return resource ?? sampleItem;
  }

  async update(id: string, input: UpdateSampleItemInput): Promise<SampleItem | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const container = getContainer();
    const updated: SampleItem = {
      ...existing,
      ...input,
      description: input.description || undefined,
      id,
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await container.item(id, id).replace<SampleItem>(updated);
    return resource ?? updated;
  }

  async delete(id: string): Promise<void> {
    const container = getContainer();
    await container.item(id, id).delete();
  }
}
