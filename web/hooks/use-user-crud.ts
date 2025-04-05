import { apiFetch } from '@/lib/apiClient';
import { useState } from 'react';
import { DbUserResponse, CreateUserParams } from '@/types/userProfile';

interface DbResponse<T> {
        success: boolean;
        meta:unknown;
        results: T[];
}

interface UseUserCrudReturn {
    isLoading: boolean;
    error: string | null;
    users: DbUserResponse[];
    fetchUsers: () => Promise<DbUserResponse[] | undefined>;
    fetchUserByAddress: (address: string) => Promise<DbResponse<DbUserResponse> | null>;
    createOrUpdateUser: (user: CreateUserParams) => Promise<DbResponse<DbUserResponse> | null>;
    removeUser: (address: string) => Promise<DbResponse<DbUserResponse> | null>;
    syncUserPoints: (address: string, points: number) => Promise<DbResponse<DbUserResponse> | null>;
}

export function useUserCrud(): UseUserCrudReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<DbUserResponse[]>([]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiFetch<DbResponse<DbUserResponse>>('/api/user', {
                method: 'GET'
            })
            const data = await response;
            console.log("fetchUsers data", data)
            if (!data.success) {
                throw new Error("Failed to fetch users");
            }
            setUsers(data.results || []);
            return data.results || [];
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserByAddress = async (address: string): Promise<DbResponse<DbUserResponse> | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiFetch<DbResponse<DbUserResponse>>(`/api/user/id?address=${address}`, {
                method: 'GET',
            })
            const data = await response;      
            console.log("fetchUserByAddress data", data);
            if (!data.success) {
                throw new Error("Failed to fetch user");
            }
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch user');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const createOrUpdateUser = async (user: CreateUserParams): Promise<DbResponse<DbUserResponse> | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiFetch<DbResponse<DbUserResponse>>('/api/user', {
                method: 'POST',
                body: JSON.stringify(user)
            })
            const data = await response
            if (!data.success) {
                throw new Error("Failed to create user");
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

    const syncUserPoints = async (address: string, points: number): Promise<DbResponse<DbUserResponse> | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiFetch<DbResponse<DbUserResponse>>('/api/user/points', {
                method: 'PATCH',
                body: JSON.stringify({ address, points })
            })
            const data = await response
            if (!data.success) {
                throw new Error("Failed to sync user points");
            }
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sync user points');
            return null;
        } finally {
            setIsLoading(false);
        }
    }

    const removeUser = async (address: string): Promise<DbResponse<DbUserResponse> | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiFetch<DbResponse<DbUserResponse>>('/api/user', {
                method: 'DELETE',
                body: JSON.stringify({ address })
            })
            const data = await response
            if (!data.success) {
                throw new Error("Failed to delete user");
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
        createOrUpdateUser,
        removeUser,
        syncUserPoints
    };
}