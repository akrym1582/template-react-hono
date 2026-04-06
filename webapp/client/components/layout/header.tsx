import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth.js";
import { useExecApiHandling } from "../../hooks/use-exec-api-handling.js";
import { Button } from "../ui/button.js";

export function Header() {
  const navigate = useNavigate();
  const execApiHandling = useExecApiHandling();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="border-b bg-background px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Template React Hono</h1>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-muted-foreground">
              {user?.displayName ?? user?.userId}
            </span>
            <Button variant="outline" size="sm" onClick={() => void execApiHandling(() => logout())}>
              Logout
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={() => navigate("/login")}>
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
