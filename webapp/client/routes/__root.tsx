import { createRootRoute, Outlet } from "@tanstack/react-router";
import { RootLayout } from "../components/layout/root-layout.js";

export const Route = createRootRoute({
  component: () => (
    <RootLayout>
      <Outlet />
    </RootLayout>
  ),
});
