// Remove tRPC related code, keep only React Query if you're using it
import { QueryClient, QueryClientProvider as QueryClientProviderOG } from '@tanstack/react-query'

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return <QueryClientProviderOG client={queryClient}>{children}</QueryClientProviderOG>
}
