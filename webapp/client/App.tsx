import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RootRoute } from "./routes/__root.js";
import { IndexPage } from "./routes/index.js";
import { LoginPage } from "./routes/login.js";
import { DashboardPage } from "./routes/dashboard.js";
import { SampleDetailPage } from "./routes/sample-detail.js";
import { SampleListPage } from "./routes/sample-list.js";

/**
 * 画面遷移の定義をまとめる場所です。
 * 新しいページを追加するときは route コンポーネントを作成し、ここへ 1 行足すのが基本の流れです。
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootRoute />}>
        <Route index element={<IndexPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="samples" element={<SampleListPage />} />
        <Route path="samples/new" element={<SampleDetailPage />} />
        <Route path="samples/:id" element={<SampleDetailPage />} />
      </Route>
    </Routes>
  );
}

/** BrowserRouter で SPA 全体を包み、URL と画面を連動させます。 */
export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
