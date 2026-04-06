import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

interface LoadingContextValue {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextValue>({
  isLoading: false,
  startLoading: () => undefined,
  stopLoading: () => undefined,
});

function LoadingBackdrop() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="alert" aria-live="assertive">
      <div className="rounded-lg bg-background px-6 py-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </div>
    </div>
  );
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = useCallback(() => {
    setLoadingCount((current) => current + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((current) => Math.max(0, current - 1));
  }, []);

  const value = useMemo(
    () => ({
      isLoading: loadingCount > 0,
      startLoading,
      stopLoading,
    }),
    [loadingCount, startLoading, stopLoading]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {value.isLoading ? <LoadingBackdrop /> : null}
    </LoadingContext.Provider>
  );
}

export function useLoadingBackdrop() {
  return useContext(LoadingContext);
}
