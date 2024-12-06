'use client';

import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { UserProfile, NetworkVariables } from '@/types';
import { checkUserState } from '@/contracts';

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

  const refreshProfile = useCallback(async (address: string, networkVariables: NetworkVariables) => {
    try {
      setIsLoading(true);
      setError(null);
      const profile = await checkUserState(address, networkVariables);
      console.log(profile);
      setUserProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
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