import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface NotificationSheetProps {
  unreadCount?: number;
  className?: string;
}

export function NotificationSheet({ unreadCount = 0, className }: NotificationSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("text-muted-foreground relative", className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent-brand"></span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No new notifications</p>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
