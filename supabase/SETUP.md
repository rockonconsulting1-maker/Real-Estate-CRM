# RC CRM Setup Guide

## GoHighLevel Webhook Subscription

To ensure the `note_index` and `task_index` tables are kept in sync with GoHighLevel, you must register the following webhooks in your GHL marketplace app settings.

### Webhook URL
\`https://hnanbydtnchswrofupgd.functions.supabase.co/ghl-webhook-notes\`
(Note: Use the respective endpoint for tasks as well, or a unified one if preferred. This project currently uses specific functions.)

### Notes Webhook
- **URL**: \`https://hnanbydtnchswrofupgd.functions.supabase.co/ghl-webhook-notes\`
- **Events**:
  - \`NoteCreate\`
  - \`NoteUpdate\`
  - \`NoteDelete\`

### Tasks Webhook
- **URL**: \`https://hnanbydtnchswrofupgd.functions.supabase.co/ghl-webhook-tasks\`
- **Events**:
  - \`TaskCreate\`
  - \`TaskComplete\`
  - \`TaskDelete\`

## Initial Data Sync
After setting up the webhooks, perform an initial sync of tasks by navigating to **Settings → Integration** in the RC CRM dashboard and clicking **Sync tasks**.
