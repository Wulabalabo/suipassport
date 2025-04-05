import { queryD1 } from "../db";
import { DbUserResponse, CreateUserParams, createUserParams } from "@/types/userProfile";
import { redis } from "../kv-cache";

interface DbResponse<T> {
    success: boolean;
    meta: unknown;
    results: T[];
}

export const getUsers = async () => {
    const cacheKey = 'top_users';
    const cached = await redis.get<DbUserResponse[]>(cacheKey);
    if (cached) {
        console.log('[Redis HIT] top_users');
        return cached;
    }

    console.log('[Redis MISS] Querying D1...');

    const query = `SELECT * FROM users ORDER BY points DESC LIMIT 100`;
    const users = await queryD1<DbUserResponse[]>(query);

    await redis.set(cacheKey, JSON.stringify(users.data));

    return users.data
}

const CHUNK_SIZE = 5000; // Number of users per chunk
const CACHE_PREFIX = 'all_users:chunk:';

export const getAllUsers = async () => {
    const cacheKey = 'all_users:chunks';
    const cachedChunks = await redis.get<string[]>(cacheKey);
    
    if (cachedChunks) {
        console.log('[Redis HIT] all_users chunks');
        // Fetch all chunks in parallel
        const chunks = await Promise.all(
            cachedChunks.map(chunkKey => redis.get<DbUserResponse[]>(chunkKey))
        );
        return chunks.flat();
    }

    console.log('[Redis MISS] Querying D1 for all users...');
    
    try {
        const query = `SELECT * FROM users`;
        const users = await queryD1<DbUserResponse[]>(query);
        
        if (users.data) {
            // Split data into chunks
            const chunks: DbUserResponse[][] = [];
            for (let i = 0; i < users.data.length; i += CHUNK_SIZE) {
                chunks.push(users.data.slice(i, i + CHUNK_SIZE));
            }

            // Store chunk keys
            const chunkKeys = chunks.map((_, index) => `${CACHE_PREFIX}${index}`);
            await redis.set(cacheKey, JSON.stringify(chunkKeys), {
                ex: 3600, // 1 hour in seconds
                nx: true
            });

            // Store chunks in parallel
            await Promise.all(
                chunks.map((chunk, index) => 
                    redis.set(chunkKeys[index], JSON.stringify(chunk), {
                        ex: 3600,
                        nx: true
                    })
                )
            );
            
            console.log(`[Redis] Successfully cached ${chunks.length} chunks of users`);
        }
        
        return users.data;
    } catch (error) {
        console.error('[Redis] Error caching all users:', error);
        // If caching fails, still return the data
        const query = `SELECT * FROM users ORDER BY points DESC`;
        const users = await queryD1<DbUserResponse[]>(query);
        return users.data;
    }
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