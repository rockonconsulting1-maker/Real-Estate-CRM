import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Users, UserSquare2, Building2, 
  FileSignature, Calendar, CheckSquare, StickyNote, Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Pipeline",
    items: [
      { name: "Leads", path: "/leads", icon: UserSquare2 },
      { name: "Clients", path: "/clients", icon: Users },
      { name: "Properties", path: "/properties", icon: Building2 },
      { name: "Offers", path: "/offers", icon: FileSignature },
    ]
  },
  {
    label: "People",
    items: [
      { name: "Contacts", path: "/contacts", icon: Users },
    ]
  },
  {
    label: "Daily",
    items: [
      { name: "Calendar", path: "/calendar", icon: Calendar },
      { name: "Tasks", path: "/tasks", icon: CheckSquare },
      { name: "Notes", path: "/notes", icon: StickyNote },
    ]
  },
  {
    label: "System",
    items: [
      { name: "Settings", path: "/settings", icon: Settings },
    ]
  }
];

export function Sidebar() {
  return (
    <aside className="h-screen w-[240px] flex-col border-r border-border bg-background flex">
      <div className="p-4 flex items-center h-16 border-b border-border">
        <span className="font-bold text-lg tracking-tight text-foreground">RC CRM</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-6">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-accent-brand-soft text-accent-brand" : "text-foreground-2 hover:bg-background-sunk hover:text-foreground"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
        </div>

        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="px-3 mb-6">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground eyebrow">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-accent-brand-soft text-accent-brand" : "text-foreground-2 hover:bg-background-sunk hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
