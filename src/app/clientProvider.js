

"use client";

import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryClientProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000,   // 30 minutes
        retry: 3,                 // Retry failed queries 3 times
      }
    }
  }));

  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </TanstackQueryClientProvider>
  );
}

export function Providers({ children }) {
  return (
    <QueryClientProvider>
      {children}
    </QueryClientProvider>
  );
}

export function useCustomQuery() {
  const fetchData = async () => {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  };

  return useQuery({
    queryKey: ['customData'],
    queryFn: fetchData
  });
}