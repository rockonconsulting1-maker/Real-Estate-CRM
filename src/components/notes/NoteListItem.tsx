import { Note } from "@/types";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { FileText, Clock, ChevronRight } from "lucide-react";

interface NoteListItemProps {
  note: Note;
}

export function NoteListItem({ note }: NoteListItemProps) {
  const preview = note.body.replace(/<[^>]+>/g, '').substring(0, 100) + (note.body.length > 100 ? '...' : '');
  
  return (
    <Link to={`/notes/${note.id}${note.contactId ? `?contactId=${note.contactId}` : ''}`} className="block">
      <div className="flex items-center p-4 bg-card border-b hover:bg-muted/50 transition-colors">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm text-foreground-2 line-clamp-1">
            {preview || "Empty note"}
          </p>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(note.dateAdded || Date.now()), "MMM d, yyyy")}
            </span>
            {note.contactId && (
              <span className="flex items-center gap-1 truncate">
                <FileText className="h-3.5 w-3.5" />
                Contact: {note.contactId.substring(0, 6)}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      </div>
    </Link>
  );
}
