import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Users, UserSquare2, Building2, 
  FileSignature, Calendar, CheckSquare, StickyNote, Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", path: "/leads", icon: UserSquare2 },
  { name: "Contacts", path: "/contacts", icon: Users },
  { name: "Clients", path: "/clients", icon: Users },
  { name: "Properties", path: "/properties", icon: Building2 },
  { name: "Offers", path: "/offers", icon: FileSignature },
  { name: "Calendar", path: "/calendar", icon: Calendar },
  { name: "Tasks", path: "/tasks", icon: CheckSquare },
  { name: "Notes", path: "/notes", icon: StickyNote },
  { name: "Settings", path: "/settings", icon: Settings },
];

export function SlideOutMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="p-4 border-b border-border flex items-center h-16">
        <span className="font-bold text-lg tracking-tight">Menu</span>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-1 px-2">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors",
                isActive ? "bg-accent-brand-soft text-accent-brand" : "text-foreground hover:bg-background-sunk"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
