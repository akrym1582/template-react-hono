import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root.js";
import { Route as indexRoute } from "./routes/index.js";
import { Route as loginRoute } from "./routes/login.js";
import { Route as dashboardRoute } from "./routes/dashboard.js";

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, dashboardRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return <RouterProvider router={router} />;
}
