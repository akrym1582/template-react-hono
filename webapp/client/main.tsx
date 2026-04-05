import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./providers/auth-provider.js";
import { SWRProvider } from "./providers/swr-provider.js";
import { App } from "./App.js";
import "./styles/globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <SWRProvider>
        <App />
      </SWRProvider>
    </AuthProvider>
  </StrictMode>
);
