import { apiFetch } from '@/lib/apiClient';
import { stamp } from '@/types/db';
import { useState } from 'react';

export interface DbResponse {
    success: boolean;
    data?: {
        success: boolean;
        meta:unknown;
        results: DbUser[];
    };
    error?: string;
}

export interface DbUser{
    id: string;
    address: string;
    stamps: stamp[];
    points: number;
    created_at: string;
    updated_at: string;
    name: string;
}

interface CreateUser {
    address: string;
    stamps: stamp[];
    points: number;
    name: string;
}

interface SafeUpdateUser {
    stamp?: stamp;
    points?: number;
}

interface UseUserCrudReturn {
    isLoading: boolean;
    error: string | null;
    users: DbUser[];
    fetchUsers: () => Promise<DbUser[] | undefined>;
    fetchUserByAddress: (address: string) => Promise<DbResponse | null>;
    createNewUser: (user: CreateUser) => Promise<DbResponse | null>;
    updateUserData: (address: string, updates: SafeUpdateUser) => Promise<DbResponse | null>;
    removeUser: (address: string) => Promise<DbResponse | null>;
    syncUserPoints: (address: string, points: number) => Promise<DbResponse | null>;
}

export function useUserCrud(): UseUserCrudReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<DbUser[]>([]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiFetch<DbResponse>('/api/user', {
                method: 'GET'
            })
            const data = await response;
            console.log("fetchUsers data", data)
            if (!data.success) {
                throw new Error(data.error);
            }
            setUsers(data.data?.results || []);
            return data.data?.results || [];
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserByAddress = async (address: string): Promise<DbResponse | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiFetch<DbResponse>(`/api/user/id?address=${address}`, {
                method: 'GET',
            })
            const data = await response
            console.log("fetchUserByAddress data", data)
            if (!data.success) {
                setError(data.error ?? 'Failed to fetch user');
                return data;
            }
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch user');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const createNewUser = async (user: CreateUser): Promise<DbResponse | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiFetch<DbResponse>('/api/user', {
                method: 'POST',
                body: JSON.stringify(user)
            })
            const data = await response
            if (!data.success) {
                setError(data.error ?? 'Failed to create user');
                return data;
            }
            await fetchUsers(); // 刷新用户列表
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create user');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserData = async (
        address: string,
        updates: SafeUpdateUser
    ): Promise<DbResponse | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiFetch<DbResponse>('/api/user', {
                method: 'PATCH',
                body: JSON.stringify({ address, ...updates })
            })
            const data = await response
            if (!data.success) {
                setError(data.error ?? 'Failed to update user');
                return data;
            }
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const syncUserPoints = async (address: string, points: number) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiFetch<DbResponse>('/api/user/points', {
                method: 'PATCH',
                body: JSON.stringify({ address, points })
            })
            const data = await response
            if (!data.success) {
                setError(data.error ?? 'Failed to sync user points');
                return data;
            }
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sync user points');
            return null;
        } finally {
            setIsLoading(false);
        }
    }

    const removeUser = async (address: string): Promise<DbResponse | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiFetch<DbResponse>('/api/user', {
                method: 'DELETE',
                body: JSON.stringify({ address })
            })
            const data = await response
            if (!data.success) {
                setError(data.error ?? 'Failed to delete user');
                return data;
            }
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete user');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        users,
        fetchUsers,
        fetchUserByAddress,
        createNewUser,
        updateUserData,
        removeUser,
        syncUserPoints
    };
}