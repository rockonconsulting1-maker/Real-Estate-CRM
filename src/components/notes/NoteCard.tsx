import { Note } from "@/types";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { FileText, Clock } from "lucide-react";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  // Strip HTML for preview
  const preview = note.body.replace(/<[^>]+>/g, '').substring(0, 150) + (note.body.length > 150 ? '...' : '');
  
  return (
    <Link to={`/notes/${note.id}${note.contactId ? `?contactId=${note.contactId}` : ''}`}>
      <Card className="p-4 h-48 flex flex-col hover:border-primary/50 transition-colors">
        <div className="flex-1 overflow-hidden">
          <p className="text-sm text-foreground-2 line-clamp-5 whitespace-pre-wrap">
            {preview || "Empty note"}
          </p>
        </div>
        <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {format(new Date(note.dateAdded || Date.now()), "MMM d, yyyy")}
          </div>
          {note.contactId && (
            <div className="flex items-center gap-1.5 truncate max-w-[100px]">
              <FileText className="h-3.5 w-3.5" />
              <span className="truncate">{note.contactId.substring(0, 6)}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
