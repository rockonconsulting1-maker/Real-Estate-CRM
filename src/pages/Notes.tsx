import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { StickyNote, Grid, List as ListIcon, Plus, Search } from "lucide-react";
import { useAllNotes, useSearchNotes } from "@/hooks/useNotes";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteListItem } from "@/components/notes/NoteListItem";
import { NoteColorFilter } from "@/components/notes/NoteColorFilter";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { useDebounce } from "@/hooks/useDebounce";

export default function Notes() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const isSearching = debouncedSearch.length > 0;
  
  const allNotesQuery = useAllNotes();
  const searchNotesQuery = useSearchNotes(debouncedSearch);
  
  const isLoading = isSearching ? searchNotesQuery.isLoading : allNotesQuery.isLoading;
  let notes = isSearching ? searchNotesQuery.data : allNotesQuery.data;
  
  // Apply color filter (mocked since GHL notes might not have color, but we filter if they did)
  if (colorFilter && notes) {
    // We don't actually have color on the Note type, so for demonstration we'll just show all if filter is applied
    // In a real app, you'd filter by note.color === colorFilter
    // notes = notes.filter(n => n.color === colorFilter);
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Notes" 
        description="Search and manage all your notes."
        action={
          <Button asChild size="sm">
            <Link to="/notes/new">
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Link>
          </Button>
        }
      />
      
      <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as any)} className="justify-start">
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <ListIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <NoteColorFilter value={colorFilter} onChange={setColorFilter} />
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
            <SkeletonLoader variant={view === "grid" ? "card" : "list-row"} count={6} />
            </div>
          ) : !notes || notes.length === 0 ? (
            <EmptyState 
              icon={StickyNote} 
              title={isSearching ? "No results found" : "No notes yet"} 
              description={isSearching ? "Try adjusting your search query." : "You haven't added any notes yet."} 
              action={
                <Button asChild variant="outline">
                  <Link to="/notes/new">Create Note</Link>
                </Button>
              }
            />
          ) : (
            <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-0"}>
              {notes.map((note: any) => (
                view === "grid" 
                  ? <NoteCard key={note.id} note={note} />
                  : <NoteListItem key={note.id} note={note} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
