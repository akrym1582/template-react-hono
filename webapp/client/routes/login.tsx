import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth.js";
import { Button } from "../components/ui/button.js";

export function LoginPage() {
  const navigate = useNavigate();
  const { loginWithMsal, loginWithPassword, isLoading } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLocalLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await loginWithPassword({ userId, password });
      navigate("/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    }
  };

  const handleMsalLogin = async () => {
    setError(null);

    try {
      await loginWithMsal();
      navigate("/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center">
      <div className="w-full space-y-6 rounded-lg border bg-background p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">Sign in</h2>
          <p className="text-muted-foreground">
            Sign in with your local account or Microsoft account.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLocalLogin}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="userId">
              User ID
            </label>
            <input
              id="userId"
              className="w-full rounded-md border px-3 py-2"
              autoComplete="username"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-md border px-3 py-2"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            Sign in with User ID
          </Button>
        </form>

        <div className="relative text-center text-sm text-muted-foreground">
          <span className="bg-background px-2">or</span>
          <div className="absolute inset-x-0 top-1/2 -z-10 border-t" />
        </div>

        <Button className="w-full" variant="outline" onClick={() => void handleMsalLogin()} disabled={isLoading}>
          Sign in with Microsoft
        </Button>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
