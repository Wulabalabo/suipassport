import { useState, useCallback } from 'react';
import { DbUserResponse } from '@/types/userProfile';

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  nextCursor: number | null;
}

export function useUsers() {
  const [users, setUsers] = useState<DbUserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 100,
    nextCursor: null
  });

  const fetchUsers = useCallback(async (page: number = 1, limit: number = 100) => {
    try {
      setIsLoading(true);
      setError(null);

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
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    await fetchUsers(pagination.currentPage, pagination.itemsPerPage);
  }, [fetchUsers, pagination.currentPage, pagination.itemsPerPage]);

  return {
    users,
    isLoading,
    error,
    pagination,
    fetchUsers,
    refreshUsers
  };
} 