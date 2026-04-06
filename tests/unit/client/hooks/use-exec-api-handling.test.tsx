// @vitest-environment jsdom
import React from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useExecApiHandling } from "../../../../webapp/client/hooks/use-exec-api-handling.js";
import { LoadingProvider } from "../../../../webapp/client/providers/loading-provider.js";

const { showErrorPopupMock } = vi.hoisted(() => ({
  showErrorPopupMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../webapp/client/lib/alert.js", () => ({
  showErrorPopup: showErrorPopupMock,
}));

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <LoadingProvider>{children}</LoadingProvider>;
  };
}

describe("useExecApiHandling", () => {
  beforeEach(() => {
    document.cookie = "clearloading=; Max-Age=0; path=/";
    showErrorPopupMock.mockClear();
  });

  it("waits for the download cookie and clears it afterwards", async () => {
    const { result } = renderHook(() => useExecApiHandling(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current(async () => {
        document.cookie = "clearloading=1; path=/";
      }, { waitForDownloadCookie: true });
    });

    expect(document.cookie).not.toContain("clearloading=");
  });

  it("shows a popup when the wrapped API call fails", async () => {
    const { result } = renderHook(() => useExecApiHandling(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current(async () => {
          throw new Error("Boom");
        })
      ).rejects.toThrow("Boom");
    });

    expect(showErrorPopupMock).toHaveBeenCalledWith(expect.any(Error));
  });
});
