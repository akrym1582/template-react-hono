import { SWRConfig } from "swr";

const swrConfig = {
  dedupingInterval: 5 * 60 * 1000,
  errorRetryCount: 1,
};

interface SWRProviderProps {
  children: React.ReactNode;
}

/**
 * SWR の共通設定をまとめて注入します。
 * 再試行回数やキャッシュ方針を全体でそろえたいときの拡張ポイントです。
 */
export function SWRProvider({ children }: SWRProviderProps) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
