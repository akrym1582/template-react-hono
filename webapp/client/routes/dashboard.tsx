import React from "react";
import { useUsers } from "../hooks/use-users.js";
import type { User } from "../../shared/types/index.js";

export function DashboardPage() {
  const { data: users = [], isLoading, isError } = useUsers();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p className="text-muted-foreground">Unable to load users.</p>
      ) : (
        <div className="space-y-2">
          {users.map((user: User) => (
            <div key={user.id} className="p-4 border rounded-md">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
