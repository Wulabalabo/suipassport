import { queryD1 } from "../db";
import { SafeUser, SafeUpdateUser, stamp } from "@/types/db";

export const getUsers = async () => {
    const query = `SELECT * FROM users ORDER BY created_at DESC`;
    const users = await queryD1<SafeUser[]>(query);
    return users;
}

export const getUserByAddress = async (address: string) => {
    const query = `SELECT * FROM users WHERE address = ?`;
    const users = await queryD1<SafeUser>(query, [address]);
    return users;
}

export const createUser = async (user: SafeUser) => {
    const query = `
        INSERT INTO users (address, stamps, points, name) 
        VALUES (?, ?, ?, ?)
        RETURNING *
    `;
    const params = [user.address, JSON.stringify(user.stamps), user.points ?? 0, user.name ?? null];
    const result = await queryD1<SafeUser[]>(query, params);
    return result;
}

export const updateUser = async (address: string, update: SafeUpdateUser) => {
    // First check if user exists
    const existingUser = await getUserByAddress(address);
    if (!existingUser?.data) return null;
    const data = existingUser.data as unknown as {results: SafeUser[]};
    const currentUser = data.results[0];
    const setStatements = [];
    const params = [];
    if (update.stamp !== undefined) {
        // Parse existing stamps if they're a string
        const currentStamps:stamp[] = Array.isArray(currentUser.stamps) 
            ? currentUser.stamps 
            : JSON.parse(currentUser.stamps as string);
        
        // Check if stamp already exists
        const existingStampIndex = currentStamps.findIndex(
            (s) => s.id === update.stamp?.id
        );

        if (existingStampIndex >= 0) {
            // If stamp exists, increment its count
            currentStamps[existingStampIndex].claim_count = 
                (currentStamps[existingStampIndex].claim_count || 1) + 1;
        } else {
            // If stamp doesn't exist, add it with count 1
            currentStamps.push({
                id: update.stamp?.id,
                claim_count: 1
            });
        }

        setStatements.push('stamps = ?');
        params.push(JSON.stringify(currentStamps));
    }

    if (setStatements.length === 0) return null;

    const query = `
        UPDATE users 
        SET ${setStatements.join(', ')},
            updated_at = CURRENT_TIMESTAMP
        WHERE address = ?
        RETURNING *
    `;
    params.push(address);

    const result = await queryD1<SafeUser[]>(query, params);
    return result;
}

export const syncUserPoints = async (address: string, points: number) => {
    const query = `UPDATE users 
        SET points = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE address = ?
        RETURNING *`;
    const result = await queryD1<SafeUser[]>(query, [points, address]);
    return result
}

export const deleteUser = async (address: string) => {
    const query = `DELETE FROM users WHERE address = ? RETURNING *`;
    const result = await queryD1<SafeUser[]>(query, [address]);
    return result
}