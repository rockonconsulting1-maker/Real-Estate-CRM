import { useQuery } from '@tanstack/react-query';
import { ghlProxy } from '../ghlProxy';
import { qk } from '../queryKeys';

export type LinkedEntityType = 'opportunity' | 'property' | 'offer';

// GHL objectKey for each entity type on the other side of a contact association.
const OBJECT_KEYS: Record<LinkedEntityType, string> = {
  opportunity: 'opportunity',
  property: 'custom_objects.properties',
  offer: 'custom_objects.real_estate_offer',
};

// entityType:entityId -> contactId. Relations rarely change, so resolved
// links are kept for the lifetime of the page. Failures are not cached.
const linkedContactCache = new Map<string, string | null>();

export function clearLinkedContactCache() {
  linkedContactCache.clear();
}

/**
 * Resolves the contact linked to an opportunity / property / offer record.
 *
 * Per the Contacts Search API doc ("Fetch all related records regardless of
 * the association ID"), the contact side is queried with the `relations`
 * nested filter: searching POST /objects/{schemaKey}/records/search on the
 * custom object itself does NOT return its associated contact. The nested
 * filter matches contacts that have a relation to the given source record.
 */
export async function resolveLinkedContact(
  entityType: LinkedEntityType,
  entityId: string,
): Promise<string | null> {
  const cacheKey = `${entityType}:${entityId}`;
  const cached = linkedContactCache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const res = await ghlProxy<{ contacts: Array<{ id: string }> }>({
      method: 'POST',
      path: '/contacts/search',
      body: {
        page: 1,
        pageLimit: 1,
        filters: [
          {
            field: 'relations',
            operator: 'nested',
            value: [
              { field: 'objectKey', operator: 'eq', value: OBJECT_KEYS[entityType] },
              { field: 'recordId', operator: 'eq', value: entityId },
            ],
          },
        ],
      },
    });

    const contactId = res.contacts?.[0]?.id ?? null;
    linkedContactCache.set(cacheKey, contactId);
    return contactId;
  } catch {
    return null;
  }
}

export function useLinkedContact(entityType: LinkedEntityType, entityId: string) {
  return useQuery({
    queryKey: qk.associations.linkedContact(entityType, entityId),
    queryFn: () => resolveLinkedContact(entityType, entityId),
    enabled: !!entityId,
    staleTime: 5 * 60 * 1000,
  });
}

export async function resolveRelations(recordId: string, assocIds: string[]): Promise<any[]> {
  try {
    const data = await ghlProxy<any>({
      method: 'POST',
      path: `/associations/relations/search`,
      body: { objectId: recordId, associationTypes: assocIds },
    });
    return data?.relations || [];
  } catch (e) {
    return [];
  }
}
