import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ContextFABProps {
  icon?: React.ReactNode;
  onClick: () => void;
}

export function ContextFAB({ icon, onClick }: ContextFABProps) {
  return (
    <div className="fixed bottom-[92px] right-[18px] z-40 md:hidden">
      <Button 
        onClick={onClick}
        size="icon" 
        className="h-14 w-14 rounded-full bg-accent-brand text-accent-brand-ink shadow-[0_10px_28px_rgba(25,30,45,.10)] hover:bg-accent-brand/90"
      >
        {icon || <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
}
