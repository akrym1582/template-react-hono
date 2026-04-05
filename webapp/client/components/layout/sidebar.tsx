import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils.js";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside className={cn("w-64 border-r bg-background p-4", className)}>
      <nav className="space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              "flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground"
            )
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn(
              "flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground"
            )
          }
        >
          Users
        </NavLink>
      </nav>
    </aside>
  );
}
