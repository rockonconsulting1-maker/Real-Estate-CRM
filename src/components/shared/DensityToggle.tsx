import { AlignJustify, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";

export function DensityToggle() {
  const { density, setDensity } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setDensity(density === "comfortable" ? "compact" : "comfortable")}
      title="Toggle density"
    >
      {density === "comfortable" ? <AlignJustify className="h-5 w-5" /> : <AlignLeft className="h-5 w-5" />}
      <span className="sr-only">Toggle density</span>
    </Button>
  );
}
