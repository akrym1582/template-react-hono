import React from "react";
import { Outlet } from "react-router-dom";
import { RootLayout } from "../components/layout/root-layout.js";

export function RootRoute() {
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  );
}
