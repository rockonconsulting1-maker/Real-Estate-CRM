import { Offer } from '@/types';

export function mapOffer(raw: any): Offer {
  const props = raw.properties || {};
  return {
    id: raw.id,
    offer_id: raw.offer_id || props.offer_id || '',
    purchase_price: Number(raw.purchase_price || props.purchase_price) || 0,
    deposit_amount: Number(raw.deposit_amount || props.deposit_amount) || 0,
    expiry_date: raw.expiry_date || props.expiry_date || '',
    closing_date: raw.closing_date || props.closing_date || '',
    possession_date: raw.possession_date || props.possession_date || '',
    status: raw.status || props.status || 'pending',
    property_id: raw.property_id || props.property_id,
    property_address: raw.property_address || props.property_address,
    buyer_id: raw.buyer_id || props.buyer_id,
    buyer_name: raw.buyer_name || props.buyer_name,
    seller_id: raw.seller_id || props.seller_id,
    seller_name: raw.seller_name || props.seller_name,
    updated_at: raw.updated_at || raw.updatedAt || props.updated_at,
  };
}

export function offerExpiryState(offer: Offer) {
  if (!offer.expiry_date) return 'none';
  const expiry = new Date(offer.expiry_date).getTime();
  const now = Date.now();
  if (expiry < now) return 'expired';
  if (expiry - now < 24 * 60 * 60 * 1000) return 'expiring_soon';
  return 'active';
}
