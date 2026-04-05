import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root.js";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexPage,
});

function IndexPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Welcome</h2>
      <p className="text-muted-foreground">
        This is the template React Hono application.
      </p>
    </div>
  );
}
