import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root.js";
import { useAuth } from "../hooks/use-auth.js";
import { Button } from "../components/ui/button.js";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Sign in</h2>
        <p className="text-muted-foreground">
          Sign in with your Microsoft account to continue.
        </p>
        <Button onClick={login}>Sign in with Microsoft</Button>
      </div>
    </div>
  );
}
