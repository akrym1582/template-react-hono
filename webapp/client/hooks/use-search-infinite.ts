import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import type { SearchPage } from "../../shared/types/index.js";

interface PendingSearch {
  requestId: number;
  resolve: () => void;
  reject: (error: unknown) => void;
}

export function useSearchInfinite<TItem, TSearch extends Record<string, unknown>>(options: {
  key: string;
  initialSearch: TSearch;
  fetchPage: (search: TSearch, cursor: string | null) => Promise<SearchPage<TItem>>;
}) {
  const [search, setSearch] = useState({
    criteria: options.initialSearch,
    requestId: 0,
  });
  const pendingSearch = useRef<PendingSearch | null>(null);

  const swr = useSWRInfinite<SearchPage<TItem>, Error>(
    (pageIndex, previousPageData) => {
      if (pageIndex > 0 && !previousPageData?.nextCursor) {
        return null;
      }

      return [
        options.key,
        search.requestId,
        search.criteria,
        pageIndex === 0 ? null : previousPageData?.nextCursor ?? null,
      ] as const;
    },
    ([, , criteria, cursor]) => options.fetchPage(criteria as TSearch, cursor as string | null)
  );

  useEffect(() => {
    if (search.requestId === 0) {
      return;
    }

    void swr.setSize(1);
  }, [search, swr]);

  useEffect(() => {
    const pending = pendingSearch.current;
    if (!pending || pending.requestId !== search.requestId || swr.isValidating) {
      return;
    }

    if (swr.error) {
      pending.reject(swr.error);
    } else {
      pending.resolve();
    }
    pendingSearch.current = null;
  }, [search.requestId, swr.error, swr.isValidating]);

  const executeSearch = useCallback((criteria: TSearch) => {
    return new Promise<void>((resolve, reject) => {
      setSearch((current) => {
        const nextRequestId = current.requestId + 1;
        pendingSearch.current = {
          requestId: nextRequestId,
          resolve,
          reject,
        };
        return {
          criteria,
          requestId: nextRequestId,
        };
      });
    });
  }, []);

  const loadMore = useCallback(async () => {
    if (swr.isValidating) {
      return;
    }

    await swr.setSize((size) => size + 1);
  }, [swr]);

  const items = useMemo(
    () => swr.data?.flatMap((page) => page.items) ?? [],
    [swr.data]
  );
  const hasMore = Boolean(swr.data?.[swr.data.length - 1]?.nextCursor);

  return {
    ...swr,
    items,
    criteria: search.criteria,
    executeSearch,
    loadMore,
    hasMore,
    isLoadingInitialData: !swr.data && !swr.error,
    isLoadingMore: swr.isValidating && swr.size > 0,
  };
}
