import { useAuth } from "../../hooks/use-auth.js";
import { Button } from "../ui/button.js";

export function Header() {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <header className="border-b bg-background px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Template React Hono</h1>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-muted-foreground">{user?.username}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={login}>
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
