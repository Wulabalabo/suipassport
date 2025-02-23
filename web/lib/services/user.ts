import { queryD1 } from "../db";
import { DbUserResponse, CreateUserParams, createUserParams } from "@/types/userProfile";

interface DbResponse<T> {
    success: boolean;
    meta: unknown;
    results: T[];
}

export const getUsers = async () => {
    const query = `SELECT * FROM users ORDER BY created_at DESC`;
    const users = await queryD1<DbUserResponse[]>(query);
    return users;
}

export const getUserByAddress = async (address: string) => {
    const query = `SELECT * FROM users WHERE address = ?`;
    const users = await queryD1<DbResponse<DbUserResponse>>(query, [address]);
    return users;
}

export const createUser = async (user: CreateUserParams) => {
    const query = `
        INSERT INTO users (address, points, stamp_count, name) 
        VALUES (?, ?, ?, ?)
        RETURNING *
    `;
    const params = [user.address, user.points ?? 0, user.stamp_count ?? 0, user.name ?? null];
    const result = await queryD1<DbUserResponse[]>(query, params);
    return result;
}

export const createOrUpdateUser = async (user: CreateUserParams) => {
    const validatedUser = createUserParams.parse(user);
    const db_user = await getUserByAddress(validatedUser.address);
    if (!db_user?.data?.results[0]?.address) {
        await createUser(validatedUser);
    }
    const query = `UPDATE users 
        SET points = ?,
            stamp_count = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE address = ?
        RETURNING *`;
    const result = await queryD1<DbUserResponse[]>(query, [validatedUser.points, validatedUser.stamp_count, validatedUser.address]);
    return result
}

export const syncUserPoints = async (address: string, points: number) => {
    const query = `UPDATE users 
        SET points = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE address = ?
        RETURNING *`;
    const result = await queryD1<DbUserResponse[]>(query, [points, address]);
    return result
}

export const deleteUser = async (address: string) => {
    const query = `DELETE FROM users WHERE address = ? RETURNING *`;
    const result = await queryD1<DbUserResponse[]>(query, [address]);
    return result
}