export const qk = {
  contacts: {
    all: ['contacts'] as const,
    lists: ['contacts', 'list'] as const,
    list: (filters: any) => ['contacts', 'list', filters] as const,
    detail: (id: string) => ['contacts', 'detail', id] as const,
  },
  leads: {
    all: ['leads'] as const,
    lists: ['leads', 'list'] as const,
    list: (f: any) => ['leads', 'list', f] as const,
    detail: (id: string) => ['leads', 'detail', id] as const,
  },
  clients: {
    all: ['clients'] as const,
    lists: ['clients', 'list'] as const,
    list: (f: any) => ['clients', 'list', f] as const,
    detail: (id: string) => ['clients', 'detail', id] as const,
  },
  properties: {
    all: ['properties'] as const,
    lists: ['properties', 'list'] as const,
    list: (f: any) => ['properties', 'list', f] as const,
    detail: (id: string) => ['properties', 'detail', id] as const,
  },
  offers: {
    all: ['offers'] as const,
    lists: ['offers', 'list'] as const,
    list: (f: any) => ['offers', 'list', f] as const,
    detail: (id: string) => ['offers', 'detail', id] as const,
  },
  tasks: {
    forContact: (cid: string) => ['tasks', 'contact', cid] as const,
    all: ['tasks'] as const,
  },
  notes: {
    forContact: (cid: string) => ['notes', 'contact', cid] as const,
    detail: (id: string) => ['notes', 'detail', id] as const,
  },
  calendar: {
    all: ['calendar'] as const,
    events: (range: any) => ['calendar', 'events', range] as const,
  },
  associations: {
    relations: (rid: string, aids: string[]) => ['assoc', rid, aids] as const,
    linkedContact: (entityType: string, entityId: string) => ['assoc', 'linkedContact', entityType, entityId] as const,
  },
  dashboard: {
    summary: ['dashboard', 'summary'] as const,
  },
  savedViews: {
    scope: (s: string) => ['savedViews', s] as const,
  },
  search: {
    global: (q: string) => ['search', 'global', q] as const,
  },
};
