import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { corsHeaders } from '../_shared/cors.ts';
import { jsonError } from '../_shared/errors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log('Webhook payload:', payload);

    // GHL Webhook payload formats vary. We handle common variations.
    const type = payload.type || payload.action;
    const locationId = payload.locationId || payload.location_id;
    const contactId = payload.contactId || payload.contact_id || payload.note?.contactId;

    // Extract note data
    const note = payload.note || payload;
    const noteId = note.id || note.noteId;
    const body = note.body;
    const title = note.title;

    if (!noteId || !locationId) {
       console.error('Missing noteId or locationId', { noteId, locationId });
       return new Response(JSON.stringify({ error: 'Missing required fields' }), {
         status: 400,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
       });
    }

    const isDelete = ['NoteDeleted', 'note:deleted', 'delete'].includes(type);

    if (isDelete) {
      console.log(`Deleting note: ${noteId}`);
      const { error } = await supabase
        .from('note_index')
        .delete()
        .eq('ghl_note_id', noteId);

      if (error) throw error;
    } else {
      // Created or Updated
      console.log(`Upserting note: ${noteId}`);
      const { error } = await supabase
        .from('note_index')
        .upsert({
          ghl_note_id: noteId,
          ghl_location_id: locationId,
          ghl_contact_id: contactId,
          body: body,
          title: title,
          updated_at: new Date().toISOString()
        }, { onConflict: 'ghl_note_id' });

      if (error) throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return jsonError(error);
  }
});
