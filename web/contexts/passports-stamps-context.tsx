'use client';

import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { NetworkVariables } from '@/types';
import { getPassportData, getStampsData } from '@/contracts';
import { StampItem } from '@/types/stamp';
import { PassportItem } from '@/types/passport';



interface PassportsStampsContextType {
  stamps: StampItem[] | null;
  passport: PassportItem[] | null;
  isLoading: boolean;
  error: Error | null;
  refreshPassportStamps: (networkVariables: NetworkVariables) => Promise<void>;
  clearStamps: () => void;
}

const PassportsStampsContext = createContext<PassportsStampsContextType | undefined>(undefined);

interface PassportsStampsProviderProps {
  children: React.ReactNode;
}

export function PassportsStampsProvider({ children}: PassportsStampsProviderProps) {
  const [stamps, setStamps] = useState<StampItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [passport, setPassport] = useState<PassportItem[] | null>(null);
  const refreshPassportStamps = useCallback(async (networkVariables: NetworkVariables) => {
    try {
      setIsLoading(true);
      setError(null);
      const stamps = await getStampsData(networkVariables);
      const passport = await getPassportData(networkVariables);
      setStamps(stamps as StampItem[]);
      setPassport(passport as PassportItem[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearStamps = useCallback(() => {
    setStamps(null);
    setError(null);
  }, []);

  const value = useMemo(() => ({
    stamps,
    passport,
    isLoading,
    error,
    refreshPassportStamps,
    clearStamps,
  }), [stamps, passport, isLoading, error, refreshPassportStamps, clearStamps]);

  return (  
    <PassportsStampsContext.Provider value={value}>
      {children}
    </PassportsStampsContext.Provider>
  );
}

export function usePassportsStamps() {
  const context = useContext(PassportsStampsContext);
  if (context === undefined) {
    throw new Error('usePassportsStamps must be used within a PassportsStampsProvider');
  }
  return context;
}