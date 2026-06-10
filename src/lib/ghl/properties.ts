import { Property } from '@/types';

export function mapProperty(raw: any): Property {
  return {
    id: raw.id,
    mls: raw.mls || raw.properties?.mls || '',
    address: raw.address || raw.properties?.address || '',
    price: Number(raw.price || raw.properties?.price) || 0,
    status: raw.status || raw.properties?.status || 'active',
    beds: Number(raw.beds || raw.properties?.beds) || undefined,
    baths: Number(raw.baths || raw.properties?.baths) || undefined,
    sqft: Number(raw.sqft || raw.properties?.sqft) || undefined,
    images: raw.images || raw.properties?.images || [],
  };
}
