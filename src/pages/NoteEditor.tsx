import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useNote, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/useNotes";
import { RichTextEditor } from "@/components/notes/RichTextEditor";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Loader2, Trash2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function NoteEditor() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contactId = searchParams.get("contactId") || "";
  
  const isNew = !noteId;
  
  const { data: note, isLoading } = useNote(contactId, noteId || "");
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();
  
  const [body, setBody] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    if (note && !isNew) {
      setBody(note.body);
    }
  }, [note, isNew]);

  const handleSave = () => {
    if (!body.trim()) {
      toast({ title: "Empty Note", description: "Please enter some text before saving.", variant: "destructive" });
      return;
    }
    
    // If no contact ID is provided, in a real app we might need a contact selector
    // For this prototype, we'll assume notes are created for a specific contact or we have a default
    const targetContactId = contactId || "default-contact-id";
    
    if (isNew) {
      createMutation.mutate({
        contactId: targetContactId,
        data: { body }
      }, {
        onSuccess: () => navigate("/notes")
      });
    } else {
      updateMutation.mutate({
        contactId: targetContactId,
        noteId: noteId!,
        data: { body }
      }, {
        onSuccess: () => navigate("/notes")
      });
    }
  };

  const handleDelete = () => {
    if (isNew || !noteId) return;
    
    deleteMutation.mutate({
      contactId: contactId || "default-contact-id",
      noteId: noteId
    }, {
      onSuccess: () => navigate("/notes")
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title={isNew ? "New Note" : "Edit Note"} 
        action={
          <div className="flex items-center gap-2">
            {!isNew && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive border-destructive/20 hover:bg-destructive/10"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </div>
        }
      />
      
      <div className="p-4 flex-1 flex flex-col h-[calc(100%-80px)]">
        {isLoading && !isNew ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <RichTextEditor 
            value={body} 
            onChange={setBody} 
            placeholder="Write your note here..."
          />
        )}
      </div>
      
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete Note"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
