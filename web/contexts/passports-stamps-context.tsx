'use client';

import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { NetworkVariables } from '@/contracts';
import { getPassportData, getStampsData } from '@/contracts/query';
import { StampItem } from '@/types/stamp';
import { PassportItem } from '@/types/passport';
import { useClaimStamps } from '@/hooks/use-stamp-crud';

type QueryClaimStamp = {
  stamp_id: string;
  claim_code_start_timestamp: number;
  claim_code_end_timestamp: number;
  has_claim_code: boolean;
}

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

export function PassportsStampsProvider({ children }: PassportsStampsProviderProps) {
  const [stamps, setStamps] = useState<StampItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [passport, setPassport] = useState<PassportItem[] | null>(null);
  const { listClaimStamps } = useClaimStamps();

  const refreshPassportStamps = useCallback(async (networkVariables: NetworkVariables) => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedStamps = await getStampsData(networkVariables);
      const fetchedPassport = await getPassportData(networkVariables);
      const claimStamps = await listClaimStamps(networkVariables);

      const updatedStamps = fetchedStamps?.map(stamp => {
        const claimStamp = claimStamps?.[0]?.results?.find(
          (cs: QueryClaimStamp) => cs?.stamp_id === stamp?.id
        );
        
        if (claimStamp) {
          return {
            ...stamp,
            hasClaimCode: claimStamp.has_claim_code === 0 ? false : true,
            claimCodeStartTimestamp: claimStamp.claim_code_start_timestamp?.toString() ?? '',
            claimCodeEndTimestamp: claimStamp.claim_code_end_timestamp?.toString() ?? '',
          };
        }
        return stamp;
      }) ?? [];
      console.log(updatedStamps);
      setStamps(updatedStamps as StampItem[]);
      setPassport(fetchedPassport as PassportItem[]);
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