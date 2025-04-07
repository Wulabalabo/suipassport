import { db } from '../neondb';
import { users, stamps } from './schema';
import { eq, and, sql } from 'drizzle-orm';
import type { NewUser, UpdateUser, NewStamp, UpdateStamp, DbUserResponse, DbStampResponse } from '@/types/db';
import { redis } from '../kv-cache';

const CACHE_TTL = 3600; // 1 hour in seconds

// 用户相关操作
export const userService = {
  // 获取所有用户（分页）
  async getAll(cursor?: number, limit: number = 100) {
    const cacheKey = `users:page:${cursor || 0}:${limit}`;
    const cached = await redis.get<DbUserResponse[]>(cacheKey);
    
    if (cached) {
      console.log('[Redis HIT] users page:', cursor);
      return {
        data: cached,
        nextCursor: cached.length === limit ? (cursor || 0) + limit : null
      };
    }

    console.log('[Redis MISS] Querying database...');
    const result = await db.select()
      .from(users)
      .orderBy(users.id)
      .limit(limit)
      .offset(cursor || 0);

    // 缓存当前页数据
    await redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_TTL, nx: true });

    return {
      data: result,
      nextCursor: result.length === limit ? (cursor || 0) + limit : null
    };
  },

  // 获取所有用户（流式处理）
  async *getAllStream(batchSize: number = 500) {
    const cacheKey = 'all_users:chunks';
    const cachedChunks = await redis.get<string[]>(cacheKey);
    
    if (cachedChunks) {
      console.log('[Redis HIT] all_users chunks');
      // 从 Redis 中读取分块数据
      for (const chunkKey of cachedChunks) {
        const chunk = await redis.get<DbUserResponse[]>(chunkKey);
        if (chunk) {
          yield chunk;
        }
      }
      return;
    }

    console.log('[Redis MISS] Querying database...');
    // 从数据库查询并缓存
    const chunks: string[] = [];
    let currentChunk: DbUserResponse[] = [];
    let chunkIndex = 0;

    const result = await db.select({
      id: users.id,
      address: users.address,
      name: users.name,
      points: users.points,
      stamp_count: users.stamp_count,
      created_at: users.created_at,
      updated_at: users.updated_at
    })
      .from(users)
      .orderBy(users.id);

    for (const user of result) {
      currentChunk.push(user);
      
      if (currentChunk.length >= batchSize) {
        const chunkKey = `all_users:chunk:${chunkIndex}`;
        await redis.set(chunkKey, JSON.stringify(currentChunk), { ex: CACHE_TTL });
        chunks.push(chunkKey);
        yield currentChunk;
        
        currentChunk = [];
        chunkIndex++;
      }
    }

    // 处理最后一批数据
    if (currentChunk.length > 0) {
      const chunkKey = `all_users:chunk:${chunkIndex}`;
      await redis.set(chunkKey, JSON.stringify(currentChunk), { ex: CACHE_TTL });
      chunks.push(chunkKey);
      yield currentChunk;
    }

    // 缓存分块信息
    await redis.set(cacheKey, JSON.stringify(chunks), { ex: CACHE_TTL });
  },

  // 获取前100名用户
  async getTopUsers() {
    const cacheKey = 'top_users';
    const cached = await redis.get<DbUserResponse[]>(cacheKey);
    
    if (cached) {
      console.log('[Redis HIT] top_users');
      return cached;
    }

    console.log('[Redis MISS] Querying database...');
    const result = await db.select()
      .from(users)
      .orderBy(sql`points DESC`)
      .limit(100);

    await redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_TTL, nx: true });
    return result;
  },

  // 根据地址获取用户
  async getByAddress(address: string) {
    const cacheKey = `user:${address}`;
    const cached = await redis.get<DbUserResponse>(cacheKey);
    
    if (cached) {
      console.log('[Redis HIT] user:', address);
      return cached;
    }

    console.log('[Redis MISS] Querying database...');
    const result = await db.select()
      .from(users)
      .where(eq(users.address, address));

    if (result[0]) {
      await redis.set(cacheKey, JSON.stringify(result[0]), { ex: CACHE_TTL, nx: true });
    }
    return result[0];
  },

  // 创建用户
  async create(data: NewUser) {
    const result = await db.insert(users).values(data).returning();
    // 清除相关缓存
    await redis.del('all_users:chunks', 'top_users');
    return result[0];
  },

  // 更新用户
  async update(address: string, data: UpdateUser) {
    const result = await db.update(users)
      .set({ ...data, updated_at: new Date() })
      .where(eq(users.address, address))
      .returning();
    
    // 清除相关缓存
    await redis.del(`user:${address}`, 'all_users:chunks', 'top_users');
    return result[0];
  },

  async createOrUpdate(data: NewUser) {
    const result = await db.insert(users)
      .values(data)
      .onConflictDoUpdate({
        target: users.address,
        set: { 
          ...data,
          updated_at: new Date()
        }
      })
      .returning();
    
    // 清除相关缓存
    await redis.del(`user:${data.address}`, 'all_users:chunks', 'top_users');
    return result[0];
  },

  // 删除用户
  async delete(address: string) {
    const result = await db.delete(users)
      .where(eq(users.address, address))
      .returning();
    
    // 清除相关缓存
    await redis.del(`user:${address}`, 'all_users:chunks', 'top_users');
    return result[0];
  }
};

// 印章相关操作
export const stampService = {
  // 获取所有印章
  async getAll() {
    const cacheKey = 'stamps';
    const cached = await redis.get<DbStampResponse[]>(cacheKey);
    
    if (cached) {
      console.log('[Redis HIT] stamps');
      return cached;
    }

    console.log('[Redis MISS] Querying database...');
    const result = await db.select().from(stamps);
    await redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_TTL, nx: true });
    return result;
  },

  // 根据ID获取印章
  async getById(id: string) {
    const cacheKey = `stamp:${id}`;
    const cached = await redis.get<DbStampResponse>(cacheKey);
    
    if (cached) {
      console.log('[Redis HIT] stamp:', id);
      return cached;
    }

    console.log('[Redis MISS] Querying database...');
    const result = await db.select()
      .from(stamps)
      .where(eq(stamps.stamp_id, id));

    if (result[0]) {
      await redis.set(cacheKey, JSON.stringify(result[0]), { ex: CACHE_TTL, nx: true });
    }
    return result[0];
  },

  // 创建印章
  async create(data: NewStamp) {
    const result = await db.insert(stamps).values(data).returning();
    // 清除相关缓存
    await redis.del('stamps');
    return result[0];
  },

  // 更新印章
  async update(id: string, data: UpdateStamp) {
    const result = await db.update(stamps)
      .set({ ...data, updated_at: new Date() })
      .where(eq(stamps.stamp_id, id))
      .returning();
    
    // 清除相关缓存
    await redis.del(`stamp:${id}`, 'stamps');
    return result[0];
  },

  // 删除印章
  async delete(id: string) {
    const result = await db.delete(stamps)
      .where(eq(stamps.stamp_id, id))
      .returning();
    
    // 清除相关缓存
    await redis.del(`stamp:${id}`, 'stamps');
    return result[0];
  },

  // 验证印章
  async verify(id: string, claimCode: string) {
    const currentTime = Date.now();
    const result = await db.select()
      .from(stamps)
      .where(
        and(
          eq(stamps.stamp_id, id),
          eq(stamps.claim_code, claimCode),
          sql`${stamps.claim_code_start_timestamp} <= ${currentTime}`,
          sql`${stamps.claim_code_end_timestamp} >= ${currentTime}`
        )
      );
    return result[0];
  },

  // 增加印章计数
  async increaseCount(id: string) {
    const result = await db.update(stamps)
      .set({ 
        claim_count: sql`COALESCE(claim_count, 0) + 1`,
        updated_at: new Date()
      })
      .where(eq(stamps.stamp_id, id))
      .returning();
    
    // 清除相关缓存
    await redis.del(`stamp:${id}`, 'stamps');
    return result[0];
  }
}; 