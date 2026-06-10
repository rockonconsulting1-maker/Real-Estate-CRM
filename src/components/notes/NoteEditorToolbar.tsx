import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface NoteEditorToolbarProps {
  onFormat: (command: string) => void;
}

export function NoteEditorToolbar({ onFormat }: NoteEditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
      <ToggleGroup type="multiple" onValueChange={(vals) => {
        // Simplified for prototype
        if (vals.includes('bold')) onFormat('bold');
        if (vals.includes('italic')) onFormat('italic');
      }}>
        <ToggleGroupItem value="bold" aria-label="Toggle bold" className="h-8 w-8 px-0">
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Toggle italic" className="h-8 w-8 px-0">
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <ToggleGroup type="single" onValueChange={(val) => {
        if (val) onFormat(val);
      }}>
        <ToggleGroupItem value="insertUnorderedList" aria-label="Bullet list" className="h-8 w-8 px-0">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="insertOrderedList" aria-label="Numbered list" className="h-8 w-8 px-0">
          <ListOrdered className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <ToggleGroup type="single" defaultValue="justifyLeft" onValueChange={(val) => {
        if (val) onFormat(val);
      }}>
        <ToggleGroupItem value="justifyLeft" aria-label="Align left" className="h-8 w-8 px-0">
          <AlignLeft className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="justifyCenter" aria-label="Align center" className="h-8 w-8 px-0">
          <AlignCenter className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="justifyRight" aria-label="Align right" className="h-8 w-8 px-0">
          <AlignRight className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
