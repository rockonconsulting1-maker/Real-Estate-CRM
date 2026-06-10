import { supabase } from './supabase';

export type GhlMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface GhlRequest {
  method: GhlMethod;
  path: string;
  body?: unknown;
}

export type ProxyErrorKind = 'unauthorized' | 'forbidden' | 'not_found' | 'conflict' | 'bad_request' | 'server' | 'network';

export class ProxyError extends Error {
  constructor(public status: number, public kind: ProxyErrorKind, message: string) {
    super(message);
    this.name = 'ProxyError';
  }
}

export async function ghlProxy<T = unknown>(req: GhlRequest): Promise<T> {
  const { data, error } = await supabase.functions.invoke('ghl-proxy', {
    body: req,
  });

  if (error) {
    const status = (error as any).status || 500;
    let kind: ProxyErrorKind = 'server';
    if (status === 401) kind = 'unauthorized';
    else if (status === 403) kind = 'forbidden';
    else if (status === 404) kind = 'not_found';
    else if (status === 409) kind = 'conflict';
    else if (status === 422) kind = 'bad_request';
    else if (!navigator.onLine) kind = 'network';
    
    throw new ProxyError(status, kind, error.message || 'An error occurred connecting to GHL.');
  }

  return data as T;
}
