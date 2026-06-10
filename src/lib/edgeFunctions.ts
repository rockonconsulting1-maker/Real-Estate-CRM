import { supabase } from './supabase';

export async function globalSearch(query: string, limit = 5) {
  const { data, error } = await supabase.functions.invoke('global-search', { body: { query, limit } });
  if (error) throw error;
  return data;
}

export async function searchNotes(query: string, limit = 20) {
  const { data, error } = await supabase.functions.invoke('search-notes', { body: { query, limit } });
  if (error) throw error;
  return data;
}

export async function driveTime(origin: string, destination: string) {
  const { data, error } = await supabase.functions.invoke('drive-time', { body: { origin, destination } });
  if (error) throw error;
  return data;
}

export async function listSavedViews(scope: string) {
  // Edge function takes scope in query parameters, wait actually supabase invoke uses body for POST/GET usually, but fetch handles it.
  // We'll pass it in body for consistency, assuming the edge function parses URL or body.
  // Actually, Supabase edge functions with GET might need it in URL, let's invoke with POST or pass it via URL.
  // Docs say `GET list-saved-views?scope=`. We can append it.
  const { data, error } = await supabase.functions.invoke(`list-saved-views?scope=${scope}`, { method: 'GET' });
  if (error) throw error;
  return data;
}

export async function upsertSavedView(view: any) {
  const { data, error } = await supabase.functions.invoke('upsert-saved-view', { body: view });
  if (error) throw error;
  return data;
}

export async function deleteSavedView(id: string) {
  const { data, error } = await supabase.functions.invoke('delete-saved-view', { body: { id }, method: 'DELETE' });
  if (error) throw error;
  return data;
}

export async function inviteAssistant(email: string) {
  const { data, error } = await supabase.functions.invoke('invite-assistant', { body: { email } });
  if (error) throw error;
  return data;
}

export async function acceptInvite(token: string) {
  const { data, error } = await supabase.functions.invoke('accept-invite', { body: { token } });
  if (error) throw error;
  return data;
}

export async function revokeAssistant(assistantUserId: string) {
  const { data, error } = await supabase.functions.invoke('revoke-assistant', { body: { assistant_user_id: assistantUserId } });
  if (error) throw error;
  return data;
}

export async function updateAssistantTemplate(assistantUserId: string, template: string) {
  const { data, error } = await supabase.functions.invoke('update-assistant-template', { body: { assistant_user_id: assistantUserId, template } });
  if (error) throw error;
  return data;
}
