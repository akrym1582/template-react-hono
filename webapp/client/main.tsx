import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./providers/auth-provider.js";
import { LoadingProvider } from "./providers/loading-provider.js";
import { SWRProvider } from "./providers/swr-provider.js";
import { App } from "./App.js";
import "./styles/globals.css";
import "sweetalert2/dist/sweetalert2.min.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

/**
 * React アプリの最上位です。
 * 認証やデータ取得の Provider をここにまとめると、後からテーマや通知機能を追加するときも
 * どこに差し込めばよいか一目で分かります。
 */
createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <LoadingProvider>
        <SWRProvider>
          <App />
        </SWRProvider>
      </LoadingProvider>
    </AuthProvider>
  </StrictMode>
);
