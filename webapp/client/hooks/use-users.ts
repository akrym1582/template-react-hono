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

/** 一覧取得専用の fetcher です。SWR から繰り返し呼ばれることを想定しています。 */
async function fetchUsers() {
  const res = await apiClient.api.users.$get();
  if (!res.ok) {
    throw new Error("Failed to load users");
  }
  return res.json();
}

/**
 * ユーザー一覧を購読するフックです。
 * 一覧画面を増やすときは、この戻り値をそのまま使うだけでローディング状態も扱えます。
 */
export function useUsers() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<User[]>(USERS_KEY, fetchUsers);

  return {
    data,
    error,
    isLoading,
    isValidating,
    isError: !!error,
    mutate,
  };
}

/** 作成後に一覧を再検証し、画面を最新状態へそろえるためのフックです。 */
export function useCreateUser() {
  const { mutate } = useSWRConfig();
  const mutation = useSWRMutation(USERS_KEY, async (_key: string, { arg }: { arg: CreateUserInput }) => {
    const res = await apiClient.api.users.$post({ json: arg });
    return res.json();
  }, {
    onSuccess: () => {
      void mutate(USERS_KEY);
    },
  });

  return {
    ...mutation,
    mutate: mutation.trigger,
    mutateAsync: mutation.trigger,
  };
}

/** 更新処理専用フックです。ID と更新内容をまとめて受け取ります。 */
export function useUpdateUser() {
  const { mutate } = useSWRConfig();
  const mutation = useSWRMutation(
    USERS_KEY,
    async (_key: string, { arg }: { arg: { id: string; data: UpdateUserInput } }) => {
      const res = await apiClient.api.users[":id"].$put({ param: { id: arg.id }, json: arg.data });
      return res.json();
    },
    {
      onSuccess: () => {
        void mutate(USERS_KEY);
      },
    }
  );

  return {
    ...mutation,
    mutate: mutation.trigger,
    mutateAsync: mutation.trigger,
  };
}

/** 削除後も一覧を再取得し、手動で状態同期しなくて済むようにしています。 */
export function useDeleteUser() {
  const { mutate } = useSWRConfig();
  const mutation = useSWRMutation(USERS_KEY, async (_key: string, { arg }: { arg: string }) => {
    const res = await apiClient.api.users[":id"].$delete({ param: { id: arg } });
    return res.json();
  }, {
    onSuccess: () => {
      void mutate(USERS_KEY);
    },
  });

  return {
    ...mutation,
    mutate: mutation.trigger,
    mutateAsync: mutation.trigger,
  };
}
