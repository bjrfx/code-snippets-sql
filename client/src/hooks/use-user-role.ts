import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { userAPI } from '@/lib/api';

// Define user role types
export type UserRole = 'free' | 'paid' | 'admin' | null;

// Hook to get and check user roles
export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userData = await userAPI.getById(user.id);
        
        if (userData) {
          // Check for temporary premium access
          if (userData.temporaryPremiumAccess && userData.temporaryPremiumExpiry) {
            const now = Date.now();
            if (now < userData.temporaryPremiumExpiry) {
              // User has valid temporary premium access
              setRole('paid');
              return;
            }
          }
          
          // Use regular role if no temporary access or if it has expired
          setRole(userData.role || 'free');
        } else {
          setRole('free'); // Default to free if no user document exists
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('free'); // Default to free on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  // Helper functions to check roles
  const isPaid = role === 'paid' || role === 'admin';
  const isAdmin = role === 'admin';
  const isFree = role === 'free';

  return {
    role,
    isLoading,
    isPaid,
    isAdmin,
    isFree,
    // Function to check if user has access to a feature based on required role
    hasAccess: (requiredRole: 'free' | 'paid' | 'admin') => {
      if (requiredRole === 'free') return true; // Everyone has access to free features
      if (requiredRole === 'paid') return isPaid; // Paid and admin have access to paid features
      if (requiredRole === 'admin') return isAdmin; // Only admin has access to admin features
      return false;
    }
  };
}