import { ghlProxy } from '../ghlProxy';

export async function resolveLinkedContact(entityId: string, entityType: string): Promise<string | null> {
  try {
    const data = await ghlProxy<any>({
      method: 'GET',
      path: `/associations/relations/${entityId}`
    });
    const contactRelation = data?.relations?.find((r: any) => r.objectType === 'contact');
    return contactRelation ? contactRelation.objectId : null;
  } catch (e) {
    return null;
  }
}

export async function resolveRelations(recordId: string, assocIds: string[]): Promise<any[]> {
  try {
    const data = await ghlProxy<any>({
      method: 'POST',
      path: `/associations/relations/search`,
      body: { objectId: recordId, associationTypes: assocIds }
    });
    return data?.relations || [];
  } catch (e) {
    return [];
  }
}
