'use client';

import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { NetworkVariables } from '@/contracts';
import { getStampsData } from '@/contracts/query';
import { DbStampResponse, StampItem } from '@/types/stamp';
import { useStampCRUD } from '@/hooks/use-stamp-crud';
import { DbUserResponse } from '@/types/userProfile';

interface AppContextType {
  // Stamps related
  stamps: StampItem[] | null;
  stampsLoading: boolean;
  stampsError: Error | null;
  refreshStamps: (networkVariables: NetworkVariables) => Promise<void>;
  clearStamps: () => void;

  // Users related
  users: DbUserResponse[];
  usersLoading: boolean;
  usersError: Error | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    nextCursor: number | null;
  };
  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Stamps state
  const [stamps, setStamps] = useState<StampItem[] | null>(null);
  const [stampsLoading, setStampsLoading] = useState(false);
  const [stampsError, setStampsError] = useState<Error | null>(null);
  const { getStamps } = useStampCRUD();

  // Users state
  const [users, setUsers] = useState<DbUserResponse[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 100,
    nextCursor: null
  });

  // Stamps methods
  const refreshStamps = useCallback(async (networkVariables: NetworkVariables) => {
    try {
      setStampsLoading(true);
      setStampsError(null);

      const [fetchedStamps, claimStamps] = await Promise.all([
        getStampsData(networkVariables),
        getStamps()
      ]);

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
    } catch (err) {
      setStampsError(err instanceof Error ? err : new Error('Failed to fetch stamps'));
    } finally {
      setStampsLoading(false);
    }
  }, []);

  const clearStamps = useCallback(() => {
    setStamps(null);
    setStampsError(null);
  }, []);

  // Users methods
  const fetchUsers = useCallback(async (page: number = 1, limit: number = 100) => {
    try {
      setUsersLoading(true);
      setUsersError(null);

      const response = await fetch(`/api/user?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const { data, pagination: paginationData } = await response.json();
      
      setUsers(data);
      setPagination({
        currentPage: paginationData.currentPage,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.totalItems,
        itemsPerPage: paginationData.itemsPerPage,
        nextCursor: paginationData.nextCursor
      });
    } catch (err) {
      setUsersError(err instanceof Error ? err : new Error('Failed to fetch users'));
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    await fetchUsers(pagination.currentPage, pagination.itemsPerPage);
  }, [fetchUsers, pagination.currentPage, pagination.itemsPerPage]);

  const value = useMemo(() => ({
    // Stamps
    stamps,
    stampsLoading,
    stampsError,
    refreshStamps,
    clearStamps,

    // Users
    users,
    usersLoading,
    usersError,
    pagination,
    fetchUsers,
    refreshUsers
  }), [
    stamps,
    stampsLoading,
    stampsError,
    refreshStamps,
    clearStamps,
    users,
    usersLoading,
    usersError,
    pagination,
    fetchUsers,
    refreshUsers
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 