import { NavLink } from "react-router-dom";
import { LayoutDashboard, UserSquare2, Users, Calendar, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", path: "/leads", icon: UserSquare2 },
  { name: "Clients", path: "/clients", icon: Users },
  { name: "Contacts", path: "/contacts", icon: Users },
  { name: "Calendar", path: "/calendar", icon: Calendar },
  { name: "Tasks", path: "/tasks", icon: CheckSquare },
];

export function BottomTabBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[84px] items-start justify-around border-t border-border bg-background/80 pb-safe pt-2 backdrop-blur-[14px]">
      {TABS.map((tab) => (
        <NavLink
          key={tab.name}
          to={tab.path}
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 min-w-[56px] py-1 transition-colors",
            isActive ? "text-accent-brand" : "text-muted-foreground"
          )}
        >
          <tab.icon className={cn("h-6 w-6", "transition-all")} />
          <span className="text-[10px] font-medium">{tab.name}</span>
        </NavLink>
      ))}
    </div>
  );
}
