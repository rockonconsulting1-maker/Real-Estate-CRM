// View models and shared DTOs

export type AppUserRole = 'agent' | 'assistant';
export type ThemePref = 'light' | 'dark' | 'system';
export type DensityPref = 'comfortable' | 'compact';

export interface AppUser {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role: AppUserRole;
  phone?: string | null;
  ghl_user_id?: string | null;
  ghl_location_id?: string | null;
  theme_pref: ThemePref;
  density_pref: DensityPref;
  pipeline_mapping?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface UserLocationLink {
  id: string;
  app_user_id: string;
  ghl_location_id: string;
  ghl_user_id?: string | null;
  is_primary: boolean;
  permission_template: string;
  revoked_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type ContactRole = 
  | 'buyer_lead' | 'seller_lead' | 'buyer_client' | 'seller_client' 
  | 'past_buyer_client' | 'vendor' | 'soi' | 'referral_partner' | 'other';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags: string[];
  role: ContactRole;
  customFields: Record<string, any>;
  assignedTo?: string;
  type?: string;
  avatarUrl?: string;
  dateAdded?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  source?: string;
  companyName?: string;
  website?: string;
}

export interface Opportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: string;
  monetaryValue: number;
  contactId: string;
}

export interface Property {
  id: string;
  mls: string;
  address: string;
  price: number;
  status: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  images: string[];
}

export interface Offer {
  id: string;
  offer_id: string;
  purchase_price: number;
  deposit_amount: number;
  expiry_date: string;
  closing_date: string;
  possession_date?: string;
  status: string;
  property_id?: string;
  property_address?: string;
  buyer_id?: string;
  buyer_name?: string;
  seller_id?: string;
  seller_name?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  assignedTo?: string;
  contactId?: string;
}

export interface Note {
  id: string;
  body: string;
  dateAdded: string;
  updatedAt: string;
  contactId?: string;
}

export interface Appointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  calendarId: string;
  contactId: string;
}
