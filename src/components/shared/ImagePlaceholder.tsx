import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  text?: string;
}

export function ImagePlaceholder({ width = "100%", height = 200, className, text = "No Image" }: ImagePlaceholderProps) {
  return (
    <div 
      className={cn("image-placeholder rounded-md", className)}
      style={{ width, height }}
    >
      {text}
    </div>
  );
}
