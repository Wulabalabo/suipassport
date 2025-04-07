'use client';

import { createContext, useContext, useCallback, useMemo, useState, useRef } from 'react';
import { NetworkVariables } from '@/contracts';
import { getStampsData } from '@/contracts/query';
import { DbStampResponse, StampItem } from '@/types/stamp';
import { useStampCRUD } from '@/hooks/use-stamp-crud';
import { DbUserResponse } from '@/types/userProfile';
import { useStreamData } from '@/hooks/use-stream-data';

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
  const { getStamps } = useStampCRUD();
  const isProcessingRef = useRef(false);
  const lastNetworkVariablesRef = useRef<NetworkVariables | null>(null);
  
  // 使用自定义 hook 处理流式数据
  const { 
    data: passport, 
    isLoading: isPassportLoading, 
    error: passportError,
    processStream: processPassportStream,
    clearData: clearPassportData
  } = useStreamData<DbUserResponse>();

  const refreshPassportStamps = useCallback(async (networkVariables: NetworkVariables) => {
    // 防止重复调用
    if (isProcessingRef.current) return;
    
    // 检查 networkVariables 是否发生变化
    const currentVars = JSON.stringify(networkVariables);
    const lastVars = JSON.stringify(lastNetworkVariablesRef.current);
    if (currentVars === lastVars) return;
    
    isProcessingRef.current = true;
    lastNetworkVariablesRef.current = networkVariables;

    try {
      setIsLoading(true);
      setError(null);
      clearPassportData();

      // 并行获取 stamps 和 claim stamps
      const [fetchedStamps, claimStamps] = await Promise.all([
        getStampsData(networkVariables),
        getStamps()
      ]);

      // 处理 stamps 数据
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

      // 使用流式处理获取 passport 数据
      await processPassportStream('/api/user', {
        onError: (err) => {
          setError(err);
          setIsLoading(false);
          isProcessingRef.current = false;
        },
        onComplete: () => {
          setIsLoading(false);
          isProcessingRef.current = false;
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  }, []);

  const clearStamps = useCallback(() => {
    setStamps(null);
    setError(null);
    clearPassportData();
  }, [clearPassportData]);

  const value = useMemo(() => ({
    stamps,
    passport,
    isLoading: isLoading || isPassportLoading,
    error: error || passportError,
    refreshPassportStamps,
    clearStamps,
  }), [stamps, passport, isLoading, isPassportLoading, error, passportError, refreshPassportStamps, clearStamps]);

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