import { queryD1 } from "../db";

interface SafeUser {
    address: string;
    stamps: string[];  // JSON array stored as string
    points: number;
}

interface SafeUpdateUser {
    stamp?: string;
    points?: number;
}

export const getUsers = async () => {
    const query = `SELECT * FROM users ORDER BY created_at DESC`;
    const users = await queryD1<SafeUser[]>(query);
    return users;
}

export const getUserByAddress = async (address: string) => {
    const query = `SELECT * FROM users WHERE address = ?`;
    const users = await queryD1<SafeUser[]>(query, [address]);
    return users;
}

export const createUser = async (user: SafeUser) => {
    const query = `
        INSERT INTO users (address, stamps, points) 
        VALUES (?, ?, ?)
        RETURNING *
    `;
    const params = [user.address, JSON.stringify(user.stamps), user.points];
    const result = await queryD1<SafeUser[]>(query, params);
    return result
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
        // Validate stamp format
        if (typeof update.stamp !== 'string') {
            return {
                success: false,
                error: "Invalid stamp format - must be a string"
            };
        }

        // Parse existing stamps if they're a string
        const currentStamps = Array.isArray(currentUser.stamps) 
            ? currentUser.stamps 
            : JSON.parse(currentUser.stamps as string);

        // Check if stamp already exists
        if (currentStamps.includes(update.stamp)) {
            return {
                success: false,
                error: "Stamp already exists for this user"
            };
        }

        // Add the new stamp to existing stamps array
        currentStamps.push(update.stamp);
        setStatements.push('stamps = ?');
        params.push(JSON.stringify(currentStamps));

        // Only add points if a valid stamp is added
        if (update.points !== undefined) {
            const newPoints = currentUser.points + update.points;
            setStatements.push('points = ?');
            params.push(newPoints);
        }
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

export const deleteUser = async (address: string) => {
    const query = `DELETE FROM users WHERE address = ? RETURNING *`;
    const result = await queryD1<SafeUser[]>(query, [address]);
    return result
}