import { increaseClaimStampCount } from '@/lib/services/claim-stamps';
import { stamp } from '@/types/db';
import { useState } from 'react';

export interface DbResponse {
    success: boolean;
    data?: {
        success: boolean;
        meta:unknown;
        results: DbUser[];
    };
    error: string;
}

export interface DbUser{
    id: string;
    address: string;
    stamps: stamp[];
    points: number;
    created_at: string;
    updated_at: string;
}

interface CreateUser {
    address: string;
    stamps: stamp[];
    points: number;
}

interface SafeUpdateUser {
    stamp?: stamp;
    points?: number;
}

interface UseUserCrudReturn {
    isLoading: boolean;
    error: string | null;
    users: DbUser[];
    fetchUsers: () => Promise<void>;
    fetchUserByAddress: (address: string) => Promise<DbResponse | null>;
    createNewUser: (user: CreateUser) => Promise<DbResponse | null>;
    updateUserData: (address: string, eventId: string, updates: SafeUpdateUser) => Promise<DbResponse | null>;
    removeUser: (address: string) => Promise<DbResponse | null>;
}

export function useUserCrud(): UseUserCrudReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<DbUser[]>([]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('/api/user', {
                method: 'GET'
            })
            const data = await response.json() as DbResponse;
            console.log(data)
            if (!data.success) {
                throw new Error(data.error);
            }
            setUsers(data.data?.results || []);
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
            const response = await fetch(`/api/user/id?address=${address}`, {
                method: 'GET',
            })
            const data = await response.json() as DbResponse;
            if (!data.success) {
                setError(data.error);
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
            const response = await fetch('/api/user', {
                method: 'POST',
                body: JSON.stringify(user)
            })
            const data = await response.json() as DbResponse;
            if (!data.success) {
                setError(data.error);
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
        eventId: string,
        updates: SafeUpdateUser
    ): Promise<DbResponse | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('/api/user', {
                method: 'PATCH',
                body: JSON.stringify({ address, ...updates })
            })
            const data = await response.json() as DbResponse;
            if (!data.success) {
                setError(data.error);
                return data;
            }
            const updateStamp = await increaseClaimStampCount(eventId);
            if(!updateStamp.success){
                setError(updateStamp.error || 'Failed to update stamp');
                return null;
            }
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const removeUser = async (address: string): Promise<DbResponse | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('/api/user', {
                method: 'DELETE',
                body: JSON.stringify({ address })
            })
            const data = await response.json() as DbResponse;
            if (!data.success) {
                setError(data.error);
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
    };
}