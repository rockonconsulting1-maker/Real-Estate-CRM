import { cn } from "@/lib/utils";

interface StageDotProps {
  color?: string;
  variant?: "primary" | "success" | "warning" | "destructive" | "info" | "muted";
  className?: string;
}

export function StageDot({ color, variant = "primary", className }: StageDotProps) {
  const isPreset = !color;
  
  return (
    <span 
      className={cn(
        "stage-dot", 
        isPreset && {
          "bg-primary": variant === "primary",
          "bg-success": variant === "success",
          "bg-warning": variant === "warning",
          "bg-destructive": variant === "destructive",
          "bg-info": variant === "info",
          "bg-muted": variant === "muted",
        },
        className
      )} 
      style={color ? { backgroundColor: color } : undefined}
    />
  );
}
