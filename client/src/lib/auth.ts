import { authAPI, setAuthToken, getAuthToken } from './api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryClient } from './queryClient';

export async function signIn(email: string, password: string) {
  try {
    const { user, token } = await authAPI.signin(email, password);
    setAuthToken(token);
    // Invalidate auth query to trigger refetch
    queryClient.invalidateQueries({ queryKey: ['auth'] });
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function signUp(email: string, password: string) {
  try {
    const { user, token } = await authAPI.signup(email, password);
    setAuthToken(token);
    // Invalidate auth query to trigger refetch
    queryClient.invalidateQueries({ queryKey: ['auth'] });
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function signOut() {
  setAuthToken(null);
  // Clear all queries to reset the app state
  queryClient.clear();
  // Set auth query to null explicitly
  queryClient.setQueryData(['auth'], null);
}

export async function resetPassword(email: string) {
  // This would need to be implemented on the backend
  throw new Error("Password reset not yet implemented");
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        return null;
      }
      try {
        return await authAPI.me();
      } catch (error) {
        // Token is invalid, clear it
        setAuthToken(null);
        return null;
      }
    },
    staleTime: Infinity,
    // Ensure the query refetches when explicitly invalidated
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  return { user, isLoading, isAuthenticated: !!user };
}