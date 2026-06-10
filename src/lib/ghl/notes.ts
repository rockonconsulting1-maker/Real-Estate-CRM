import { Note } from '@/types';

export function mapNote(raw: any): Note {
  return {
    id: raw.id,
    body: raw.body || '',
    dateAdded: raw.dateAdded || '',
    updatedAt: raw.updatedAt || '',
    contactId: raw.contactId,
  };
}
