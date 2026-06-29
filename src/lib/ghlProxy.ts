import { FunctionsHttpError } from '@supabase/supabase-js';
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

function kindForStatus(status: number): ProxyErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 422) return 'bad_request';
  if (!navigator.onLine) return 'network';
  return 'server';
}

export async function ghlProxy<T = unknown>(req: GhlRequest): Promise<T> {
  const { data, error } = await supabase.functions.invoke('ghl-proxy', {
    body: req,
  });

  if (error) {
    let status = 500;
    let message = error.message || 'An error occurred connecting to GHL.';

    // FunctionsHttpError carries the proxy's Response in error.context;
    // the body is { message, statusCode } as written by the ghl-proxy function.
    if (error instanceof FunctionsHttpError) {
      status = error.context?.status ?? 500;
      try {
        const payload = await error.context.json();
        if (typeof payload?.statusCode === 'number') status = payload.statusCode;
        if (typeof payload?.message === 'string' && payload.message) message = payload.message;
      } catch {
        // Non-JSON or already-consumed body — keep the Response status.
      }
    }

    throw new ProxyError(status, kindForStatus(status), message);
  }

  return data as T;
}
