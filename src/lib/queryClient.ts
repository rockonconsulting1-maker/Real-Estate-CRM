import { QueryClient } from '@tanstack/react-query';
import { ProxyError } from './ghlProxy';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 60s
      retry: (failureCount, error) => {
        if (error instanceof ProxyError) {
          if (error.kind === 'unauthorized' || error.kind === 'forbidden') {
            return false;
          }
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
  },
});
