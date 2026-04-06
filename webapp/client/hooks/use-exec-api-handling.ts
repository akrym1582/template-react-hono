import { useCallback } from "react";
import { DOWNLOAD_CLEAR_LOADING_COOKIE } from "../../shared/constants/index.js";
import { showErrorPopup } from "../lib/alert.js";
import { useLoadingBackdrop } from "../providers/loading-provider.js";

function hasCookie(name: string) {
  return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${name}=`));
}

function clearCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
}

async function waitForCookie(name: string, timeoutMs: number) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (hasCookie(name)) {
      clearCookie(name);
      return;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 200));
  }

  throw new Error("Download did not complete in time");
}

export function useExecApiHandling() {
  const { startLoading, stopLoading } = useLoadingBackdrop();

  return useCallback(
    async <T>(
      task: () => Promise<T>,
      options?: {
        showLoading?: boolean;
        waitForDownloadCookie?: boolean;
        notifyError?: boolean;
        downloadTimeoutMs?: number;
      }
    ) => {
      const {
        showLoading = true,
        waitForDownloadCookie = false,
        notifyError = true,
        downloadTimeoutMs = 60_000,
      } = options ?? {};

      if (showLoading) {
        startLoading();
      }

      try {
        const result = await task();

        if (waitForDownloadCookie) {
          await waitForCookie(DOWNLOAD_CLEAR_LOADING_COOKIE, downloadTimeoutMs);
        }

        return result;
      } catch (error) {
        if (notifyError) {
          await showErrorPopup(error);
        }
        throw error;
      } finally {
        if (showLoading) {
          stopLoading();
        }
      }
    },
    [startLoading, stopLoading]
  );
}
