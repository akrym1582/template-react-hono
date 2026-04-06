import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { buildSampleItemsCsvUrl, useSampleItemsSearch } from "../hooks/use-sample-items.js";
import { useExecApiHandling } from "../hooks/use-exec-api-handling.js";
import type { SampleItemSearchInput } from "../../shared/validators/index.js";

const initialSearch: SampleItemSearchInput = {
  keyword: "",
  category: "",
  limit: 20,
};

export function SampleListPage() {
  const execApiHandling = useExecApiHandling();
  const [form, setForm] = useState(initialSearch);
  const {
    items,
    error,
    hasMore,
    loadMore,
    executeSearch,
    isLoadingInitialData,
    isLoadingMore,
  } = useSampleItemsSearch(initialSearch);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        void loadMore();
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const emptyMessage = useMemo(() => {
    if (isLoadingInitialData) {
      return "Loading...";
    }
    if (error) {
      return "Unable to load sample items.";
    }
    return "No sample items found.";
  }, [error, isLoadingInitialData]);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await execApiHandling(() => executeSearch(form), { notifyError: false });
  };

  const handleDownloadCsv = async () => {
    await execApiHandling(
      async () => {
        const link = document.createElement("a");
        link.href = buildSampleItemsCsvUrl(form);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();
      },
      { waitForDownloadCookie: true }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">SampleList</h2>
          <p className="text-sm text-muted-foreground">条件検索、一覧表示、CSV 出力のサンプルです。</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void handleDownloadCsv()}>
            CSV Export
          </Button>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            to="/samples/new"
          >
            New Sample
          </Link>
        </div>
      </div>

      <form className="grid gap-4 rounded-lg border p-4 md:grid-cols-3" onSubmit={handleSearch}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="keyword">
            Keyword
          </label>
          <input
            id="keyword"
            className="w-full rounded-md border px-3 py-2"
            value={form.keyword}
            onChange={(event) => setForm((current) => ({ ...current, keyword: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="category">
            Category
          </label>
          <input
            id="category"
            className="w-full rounded-md border px-3 py-2"
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
          />
        </div>
        <div className="flex items-end">
          <Button className="w-full" type="submit">
            Search
          </Button>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <Link className="text-primary underline-offset-4 hover:underline" to={`/samples/${item.id}`}>
                      {item.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{item.price.toLocaleString()}</td>
                  <td className="px-4 py-3">{item.isActive ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div ref={loadMoreRef} className="h-4" />
      {isLoadingMore ? <p className="text-sm text-muted-foreground">Loading more...</p> : null}
    </div>
  );
}
