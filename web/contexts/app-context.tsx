'use client';

import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { NetworkVariables } from '@/contracts';
import { getStampsData } from '@/contracts/query';
import { StampItem, DbStampResponse } from '@/types/stamp';
import { useStampCRUD } from '@/hooks/use-stamp-crud';
import { DbUserResponse } from '@/types/userProfile';

interface AppContextType {
  // Stamps related
  stamps: StampItem[] | null;
  stampsLoading: boolean;
  stampsError: Error | null;
  refreshStamps: (networkVariables: NetworkVariables) => Promise<void>;
  clearStamps: () => void;
  updateStamp: (stampId: string, promoteUrl: string, networkVariables: NetworkVariables ) => Promise<boolean>;
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
            publicClaim: claimStamp.public_claim ?? false,
            promote_url: claimStamp.promote_url ?? null
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

  const updateStamp = useCallback(async (stampId: string, promoteUrl: string, networkVariables: NetworkVariables) => {
    try {
      // 乐观更新：立即更新前端状态
      if (stamps) {
        const updatedStamps = stamps.map(stamp => 
          stamp.id === stampId 
            ? { ...stamp, promoteUrl } 
            : stamp
        );
        setStamps(updatedStamps);
      }

      const response = await fetch(`/api/stamps/${stampId}`, {
        method: 'PUT',
        body: JSON.stringify({ promote_url: promoteUrl })
      });
      
      if (!response.ok) {
        // 如果更新失败，恢复原始状态
        await refreshStamps(networkVariables);
        throw new Error('Failed to update stamp');
      }
      
      return true;
    } catch (err) {
      console.error('Error updating stamp:', err);
      // 发生错误时刷新以获取最新状态
      await refreshStamps(networkVariables);
      return false;
    }
  }, [stamps, refreshStamps]);

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
    updateStamp,
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
    updateStamp,
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