'use client';

import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { NetworkVariables } from '@/contracts';
import { getPassportDataFromDB, getStampsData } from '@/contracts/query';
import { DbStampResponse, StampItem } from '@/types/stamp';
import { useStampCRUD } from '@/hooks/use-stamp-crud';
import { DbUserResponse } from '@/types/userProfile';

interface PassportsStampsContextType {
  stamps: StampItem[] | null;
  passport: DbUserResponse[] | null;
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
  const [passport, setPassport] = useState<DbUserResponse[] | null>(null);
  const { getStamps } = useStampCRUD();

  const refreshPassportStamps = useCallback(async (networkVariables: NetworkVariables) => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedStamps = await getStampsData(networkVariables);
      const fetchedPassport = await getPassportDataFromDB();
      const claimStamps = await getStamps();
      const updatedStamps = fetchedStamps?.map(stamp => {
        const claimStamp = claimStamps?.find((cs: DbStampResponse) => cs.stamp_id === stamp.id)
        
        if (claimStamp) {
          return {
            ...stamp,
            hasClaimCode: claimStamp?.has_claim_code,
            claimCodeStartTimestamp: claimStamp?.claim_code_start_timestamp?.toString() ?? '',
            claimCodeEndTimestamp: claimStamp?.claim_code_end_timestamp?.toString() ?? '',
            totalCountLimit: claimStamp?.total_count_limit ?? null,
            userCountLimit: claimStamp?.user_count_limit ?? null,
            claimCount: claimStamp.claim_count ?? null,
            publicClaim: claimStamp.public_claim ?? false
          };
        }
        return stamp;
      }) ?? [];
      
      setStamps(updatedStamps as StampItem[]);
      setPassport(fetchedPassport as unknown as DbUserResponse[]);
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