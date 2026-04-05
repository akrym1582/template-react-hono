import { cn } from "../../lib/utils.js";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside className={cn("w-64 border-r bg-background p-4", className)}>
      <nav className="space-y-1">
        <a
          href="/"
          className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          Dashboard
        </a>
        <a
          href="/dashboard"
          className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          Users
        </a>
      </nav>
    </aside>
  );
}
