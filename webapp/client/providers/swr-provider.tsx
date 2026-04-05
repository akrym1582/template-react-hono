import { SWRConfig } from "swr";

const swrConfig = {
  dedupingInterval: 5 * 60 * 1000,
  errorRetryCount: 1,
};

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
