import { createClient } from '@supabase/supabase-js';

export interface AuditLogEntry {
  app_user_id: string;
  ghl_location_id: string;
  ghl_user_id: string;
  action: string;
  target_id?: string;
  method: string;
  path: string;
  status_code: number;
}

/**
 * Sanitizes the audit log entry to ensure no secrets are leaked.
 */
function sanitize(entry: AuditLogEntry): AuditLogEntry {
  const sanitized = { ...entry };

  // Rule 3: Never write a GHL token or service role key into action, target_id, method, or path.
  const secretPattern = /(sb_publishable_|sb_secret_|eyJ|ghl-)/i;

  const clean = (val: string | undefined) => {
    if (!val) return val;
    if (secretPattern.test(val)) return '[REDACTED]';
    return val;
  };

  sanitized.action = clean(sanitized.action)!;
  sanitized.target_id = clean(sanitized.target_id);
  sanitized.method = clean(sanitized.method)!;
  sanitized.path = clean(sanitized.path)!;

  return sanitized;
}

export async function logAudit(entry: AuditLogEntry) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  const sanitizedEntry = sanitize(entry);

  const { error } = await adminClient
    .from('audit_log')
    .insert([sanitizedEntry]);

  if (error) {
    console.error('Failed to write audit log:', error);
  }
}
