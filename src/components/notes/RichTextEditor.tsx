import { useRef, useEffect } from "react";
import { NoteEditorToolbar } from "./NoteEditorToolbar";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Start typing..." }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Set initial value only once
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []); // Intentionally only run on mount to avoid cursor jumping

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFormat = (command: string) => {
    document.execCommand(command, false, undefined);
    handleInput();
    editorRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden bg-card">
      <NoteEditorToolbar onFormat={handleFormat} />
      <div
        ref={editorRef}
        className="flex-1 p-4 outline-none overflow-y-auto prose prose-sm dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
      />
    </div>
  );
}
