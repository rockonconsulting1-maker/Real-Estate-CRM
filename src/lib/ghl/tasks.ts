import { Task } from '@/types';

export function mapTask(raw: any): Task {
  return {
    id: raw.id,
    title: raw.title || '',
    dueDate: raw.dueDate || '',
    status: raw.status || 'pending',
    assignedTo: raw.assignedTo,
    contactId: raw.contactId,
  };
}
