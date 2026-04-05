import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root.js";
import { useUsers } from "../hooks/use-users.js";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

function DashboardPage() {
  const { data: users, isLoading } = useUsers();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-2">
          {users?.map((user: { id: string; name: string; email: string }) => (
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
