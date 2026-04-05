import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import { apiClient } from "../lib/api-client.js";
import type { CreateUserInput, UpdateUserInput } from "../../shared/validators/index.js";

export interface User {
  id: string;
  name: string;
  email: string;
}

const USERS_KEY = "users";

async function fetchUsers() {
  const res = await apiClient.api.users.$get();
  if (!res.ok) {
    throw new Error("Failed to load users");
  }
  return res.json();
}

export function useUsers() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<User[]>(USERS_KEY, fetchUsers);

  return {
    data,
    error,
    isLoading,
    isValidating,
    isError: Boolean(error),
    mutate,
  };
}

export function useCreateUser() {
  const { mutate } = useSWRConfig();
  const mutation = useSWRMutation(USERS_KEY, async (_key: string, { arg }: { arg: CreateUserInput }) => {
    const res = await apiClient.api.users.$post({ json: arg });
    return res.json();
  }, {
    onSuccess: async () => {
      await mutate(USERS_KEY);
    },
  });

  return {
    ...mutation,
    mutate: mutation.trigger,
    mutateAsync: mutation.trigger,
  };
}

export function useUpdateUser() {
  const { mutate } = useSWRConfig();
  const mutation = useSWRMutation(
    USERS_KEY,
    async (_key: string, { arg }: { arg: { id: string; data: UpdateUserInput } }) => {
      const res = await apiClient.api.users[":id"].$put({ param: { id: arg.id }, json: arg.data });
      return res.json();
    },
    {
      onSuccess: async () => {
        await mutate(USERS_KEY);
      },
    }
  );

  return {
    ...mutation,
    mutate: mutation.trigger,
    mutateAsync: mutation.trigger,
  };
}

export function useDeleteUser() {
  const { mutate } = useSWRConfig();
  const mutation = useSWRMutation(USERS_KEY, async (_key: string, { arg }: { arg: string }) => {
    const res = await apiClient.api.users[":id"].$delete({ param: { id: arg } });
    return res.json();
  }, {
    onSuccess: async () => {
      await mutate(USERS_KEY);
    },
  });

  return {
    ...mutation,
    mutate: mutation.trigger,
    mutateAsync: mutation.trigger,
  };
}
