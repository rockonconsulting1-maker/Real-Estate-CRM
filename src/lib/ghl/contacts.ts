import { Contact, ContactRole } from '@/types';

export function deriveContactRole(raw: any): ContactRole {
  const type = raw.type?.toLowerCase() || '';
  const tags = (raw.tags || []).map((t: string) => t.toLowerCase());
  
  if (type === 'customer' || tags.includes('client')) {
    if (tags.includes('buyer')) return 'buyer_client';
    if (tags.includes('seller')) return 'seller_client';
    if (tags.includes('past')) return 'past_buyer_client';
    return 'other';
  }
  
  if (type === 'lead' || tags.includes('lead')) {
    if (tags.includes('seller')) return 'seller_lead';
    return 'buyer_lead';
  }
  
  if (tags.includes('vendor')) return 'vendor';
  if (tags.includes('soi')) return 'soi';
  if (tags.includes('partner')) return 'referral_partner';
  
  return 'other';
}

export function mapContact(raw: any): Contact {
  return {
    id: raw.id,
    firstName: raw.firstName || '',
    lastName: raw.lastName || '',
    email: raw.email || '',
    phone: raw.phone || '',
    tags: raw.tags || [],
    role: deriveContactRole(raw),
    customFields: raw.customFields || {},
    assignedTo: raw.assignedTo,
    type: raw.type,
  };
}
