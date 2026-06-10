import { Bell, Search, Plus, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SlideOutMenu } from "./SlideOutMenu";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background px-4 shadow-sm md:px-6">
      {/* Mobile Left: Hamburger + Title */}
      <div className="flex items-center gap-3 md:hidden">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SlideOutMenu onClose={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold h1">RC CRM</h1>
      </div>

      {/* Desktop Left: Title */}
      <div className="hidden md:flex items-center gap-4">
        <h1 className="text-xl font-semibold h1">RC CRM</h1>
      </div>

      {/* Desktop Center: Search */}
      <div className="hidden md:flex flex-1 items-center justify-center max-w-md mx-4">
        <Button variant="outline" className="w-full justify-start text-muted-foreground bg-background-sunk border-border-2 h-9">
          <Search className="mr-2 h-4 w-4" />
          <span>Search...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="sm" className="hidden md:flex gap-1 h-9">
          <Plus className="h-4 w-4" />
          New
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent-brand"></span>
        </Button>
        <Avatar className="h-8 w-8 cursor-pointer ml-1">
          <AvatarImage src="" />
          <AvatarFallback className="bg-accent-brand-soft text-accent-brand text-xs">RC</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
