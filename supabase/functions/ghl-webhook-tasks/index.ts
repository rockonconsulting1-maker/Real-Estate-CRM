import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { getCorsHeaders } from '../_shared/cors.ts';
import { jsonError } from '../_shared/errors.ts';

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log('Task Webhook payload:', payload);

    const type = payload.type || payload.action;
    const locationId = payload.locationId || payload.location_id;

    // Extract task data
    const task = payload.task || payload;
    const taskId = task.id || task.taskId;
    const contactId = task.contactId || task.contact_id || payload.contactId;
    const title = task.title;
    const body = task.body;
    const dueDate = task.dueDate || task.due_date;
    const completed = task.status === 'completed' || task.completed === true || type === 'TaskComplete';
    const assignedTo = task.assignedTo || task.assigned_to;

    if (!taskId || !locationId) {
       console.error('Missing taskId or locationId', { taskId, locationId });
       return new Response(JSON.stringify({ error: 'Missing required fields' }), {
         status: 400,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
       });
    }

    const isDelete = ['TaskDelete', 'task:deleted', 'delete'].includes(type);

    if (isDelete) {
      console.log(`Deleting task: ${taskId}`);
      const { error } = await supabase
        .from('task_index')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } else {
      // Created, Updated, or Completed
      console.log(`Upserting task: ${taskId}`);
      const { error } = await supabase
        .from('task_index')
        .upsert({
          id: taskId,
          ghl_location_id: locationId,
          contact_id: contactId,
          title: title,
          body: body,
          due_date: dueDate,
          completed: completed,
          assigned_to: assignedTo,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Task Webhook error:', error);
    return jsonError(error, corsHeaders);
  }
});
