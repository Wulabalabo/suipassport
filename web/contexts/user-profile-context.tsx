'use client';

import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { UserProfile } from '@/types';
import { checkUserState } from '@/contracts/query';
import { NetworkVariables } from '@/contracts';
import { useUserCrud } from '@/hooks/use-user-crud';

interface UserProfileContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  refreshProfile: (address: string, networkVariables: NetworkVariables) => Promise<void>;
  clearProfile: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

interface UserProfileProviderProps {
  children: React.ReactNode;
}

export function UserProfileProvider({ children}: UserProfileProviderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { fetchUserByAddress, syncUserPoints } = useUserCrud();

  const refreshProfile = useCallback(async (address: string, networkVariables: NetworkVariables) => {
    try {
      setIsLoading(true);
      setError(null);
      const profile = await checkUserState(address, networkVariables);
      await syncUserPoints(address, profile?.points ?? 0);
      const dbProfile = await fetchUserByAddress(address);
      console.log("dbProfile", dbProfile)
      if (dbProfile?.success && profile) {
        const results = dbProfile.data?.results;
        if (Array.isArray(results) && results.length > 0) {
          profile.db_profile = results[0];
        } else {
          console.warn('No results found in dbProfile');
        }
      }

      console.log('Profile fetched:', profile);
      setUserProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setUserProfile(null);
    setError(null);
  }, []);

  const value = useMemo(() => ({
    userProfile,
    isLoading,
    error,
    refreshProfile,
    clearProfile,
  }), [userProfile, isLoading, error, refreshProfile, clearProfile]);

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}