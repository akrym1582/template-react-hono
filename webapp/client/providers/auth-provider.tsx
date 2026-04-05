import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "../lib/auth.js";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
