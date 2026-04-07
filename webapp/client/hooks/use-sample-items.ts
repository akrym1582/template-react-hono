import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { SAMPLE_ITEMS_ROUTE } from "../../shared/constants/routes.js";
import type { SampleItem, SearchPage } from "../../shared/types/index.js";
import type {
  CreateSampleItemInput,
  SampleItemSearchInput,
  UpdateSampleItemInput,
} from "../../shared/validators/index.js";
import { apiClient } from "../lib/api-client.js";
import { parseApiResponse } from "../lib/api-response.js";
import { useSearchInfinite } from "./use-search-infinite.js";

const SAMPLE_ITEM_DETAIL_KEY = "sample-item-detail";

function buildSampleSearchParams(input: Partial<SampleItemSearchInput>) {
  return {
    ...(input.keyword ? { keyword: input.keyword } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(input.cursor ? { cursor: input.cursor } : {}),
    ...(input.limit ? { limit: String(input.limit) } : {}),
  };
}

async function fetchSampleItems(search: SampleItemSearchInput, cursor: string | null) {
  const response = await apiClient.api[SAMPLE_ITEMS_ROUTE.segment].$get({
    query: buildSampleSearchParams({
      ...search,
      cursor: cursor ?? undefined,
    }),
  });

  return parseApiResponse<SearchPage<SampleItem>>(response, "Failed to load sample items");
}

export function useSampleItemsSearch(initialSearch: SampleItemSearchInput) {
  return useSearchInfinite<SampleItem, SampleItemSearchInput>({
    key: "sample-items-search",
    initialSearch,
    fetchPage: fetchSampleItems,
  });
}

export function useSampleItem(id?: string) {
  const swr = useSWR<SampleItem, Error>(
    id ? [SAMPLE_ITEM_DETAIL_KEY, id] : null,
    async () => {
      const response = await apiClient.api[SAMPLE_ITEMS_ROUTE.segment][SAMPLE_ITEMS_ROUTE.id].$get({
        param: { id: id! },
      });
      return parseApiResponse<SampleItem>(response, "Failed to load sample item");
    }
  );

  return {
    ...swr,
    isError: Boolean(swr.error),
  };
}

export function useCreateSampleItem() {
  const mutation = useSWRMutation(
    "sample-items-create",
    async (_key: string, { arg }: { arg: CreateSampleItemInput }) => {
      const response = await apiClient.api[SAMPLE_ITEMS_ROUTE.segment].$post({ json: arg });
      return parseApiResponse<SampleItem>(response, "Failed to create sample item");
    }
  );

  return {
    ...mutation,
    mutateAsync: mutation.trigger,
  };
}

export function useUpdateSampleItem() {
  const mutation = useSWRMutation(
    "sample-items-update",
    async (_key: string, { arg }: { arg: { id: string; data: UpdateSampleItemInput } }) => {
      const response = await apiClient.api[SAMPLE_ITEMS_ROUTE.segment][SAMPLE_ITEMS_ROUTE.id].$put({
        param: { id: arg.id },
        json: arg.data,
      });
      return parseApiResponse<SampleItem>(response, "Failed to update sample item");
    }
  );

  return {
    ...mutation,
    mutateAsync: mutation.trigger,
  };
}

export function useDeleteSampleItem() {
  const mutation = useSWRMutation(
    "sample-items-delete",
    async (_key: string, { arg }: { arg: string }) => {
      const response = await apiClient.api[SAMPLE_ITEMS_ROUTE.segment][SAMPLE_ITEMS_ROUTE.id].$delete({
        param: { id: arg },
      });
      return parseApiResponse<{ success: true }>(response, "Failed to delete sample item");
    }
  );

  return {
    ...mutation,
    mutateAsync: mutation.trigger,
  };
}

export function buildSampleItemsCsvUrl(search: SampleItemSearchInput) {
  const query = new URLSearchParams(buildSampleSearchParams(search));
  return `${SAMPLE_ITEMS_ROUTE.base}/${SAMPLE_ITEMS_ROUTE.export}?${query.toString()}`;
}
