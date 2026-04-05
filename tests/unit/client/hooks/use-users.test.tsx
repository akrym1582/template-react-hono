// @vitest-environment jsdom
import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useCreateUser, useUsers } from "../../../../webapp/client/hooks/use-users.js";
import type { CreateUserInput } from "../../../../webapp/shared/validators/index.js";

const { getUsersMock, postUserMock } = vi.hoisted(() => ({
  getUsersMock: vi.fn(),
  postUserMock: vi.fn(),
}));

vi.mock("../../../../webapp/client/lib/api-client.js", () => ({
  apiClient: {
    api: {
      users: {
        $get: getUsersMock,
        $post: postUserMock,
        ":id": {
          $put: vi.fn(),
          $delete: vi.fn(),
        },
      },
    },
  },
}));

function createWrapper() {
  return function SWRTestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        {children}
      </SWRConfig>
    );
  };
}

describe("useUsers", () => {
  beforeEach(() => {
    getUsersMock.mockReset();
    postUserMock.mockReset();
  });

  it("loads users with SWR", async () => {
    getUsersMock.mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "1", name: "Ada Lovelace", email: "ada@example.com" },
      ],
    });

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([
        { id: "1", name: "Ada Lovelace", email: "ada@example.com" },
      ]);
    });

    expect(result.current.isError).toBe(false);
    expect(getUsersMock).toHaveBeenCalledTimes(1);
  });

  it("flags a failed users request as an error", async () => {
    getUsersMock.mockResolvedValue({
      ok: false,
    });

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("revalidates users after creating a user", async () => {
    let users = [{ id: "1", name: "Ada Lovelace", email: "ada@example.com" }];

    getUsersMock.mockImplementation(async () => ({
      ok: true,
      json: async () => users,
    }));

    postUserMock.mockImplementation(async ({ json }: { json: CreateUserInput }) => {
      const createdUser = { id: "2", ...json };
      users = [...users, createdUser];
      return {
        json: async () => createdUser,
      };
    });

    const { result } = renderHook(
      () => ({
        users: useUsers(),
        createUser: useCreateUser(),
      }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.users.data).toHaveLength(1);
    });

    await act(async () => {
      await result.current.createUser.mutateAsync({
        name: "Grace Hopper",
        email: "grace@example.com",
      });
    });

    await waitFor(() => {
      expect(result.current.users.data).toEqual([
        { id: "1", name: "Ada Lovelace", email: "ada@example.com" },
        { id: "2", name: "Grace Hopper", email: "grace@example.com" },
      ]);
    });

    expect(postUserMock).toHaveBeenCalledTimes(1);
    expect(getUsersMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
