import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RootRoute } from "./routes/__root.js";
import { IndexPage } from "./routes/index.js";
import { LoginPage } from "./routes/login.js";
import { DashboardPage } from "./routes/dashboard.js";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootRoute />}>
        <Route index element={<IndexPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
