import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FocusModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export function FocusModeToggle({ enabled, onToggle, className }: FocusModeToggleProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Switch 
        id="focus-mode" 
        checked={enabled} 
        onCheckedChange={onToggle} 
      />
      <Label htmlFor="focus-mode" className="text-sm font-medium cursor-pointer">
        Focus Mode
      </Label>
    </div>
  );
}
