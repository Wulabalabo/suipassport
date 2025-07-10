import { db } from '../neondb';
import { users, stamps } from './schema';
import { eq, and, sql } from 'drizzle-orm';
import type { NewUser, UpdateUser, NewStamp, UpdateStamp, DbUserResponse, RawStampResponse } from '@/types/db';
import { redis } from '../kv-cache';

const CACHE_TTL = 3600; // 1 hour in seconds

// 辅助函数：计算 stamps 分布
function calculateStampsDistribution(users: { stamp_count: number | null }[]) {
  const distribution = {
    '0': 0,
    '1': 0,
    '2+': 0
  };

  users.forEach(user => {
    const count = user.stamp_count || 0;
    if (count === 0) distribution['0']++;
    else if (count === 1) distribution['1']++;
    else distribution['2+']++;
  });

  return Object.entries(distribution).map(([range, count]) => ({
    range,
    count
  }));
}

// 辅助函数：计算积分分布
function calculatePointsDistribution(users: { points: number | null }[]) {
  const distribution = {
    '0': 0,
    '100': 0,
    '200': 0,
    '200+': 0
  };

  users.forEach(user => {
    const points = user.points || 0;
    if (points === 0) distribution['0']++;
    else if (points === 100) distribution['100']++;
    else if (points === 200) distribution['200']++;
    else distribution['200+']++;
  });

  return Object.entries(distribution).map(([range, count]) => ({
    range,
    count
  }));
}

// 辅助函数：计算每日增长
function calculateGrowthByDay(users: { created_at: Date | null }[]) {
  const growthByDay: { [date: string]: number } = {};

  users.forEach(user => {
    if (!user.created_at) return;
    const date = new Date(user.created_at).toISOString().split('T')[0];
    growthByDay[date] = (growthByDay[date] || 0) + 1;
  });

  return Object.entries(growthByDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// 用户相关操作
export const userService = {
  // 获取所有用户（分页）
  async getAll(cursor?: number, limit: number = 100) {
    const cacheKey = `neon_users:page:${cursor || 0}:${limit}`;
    const totalCountKey = 'neon_users:total_count';
    const cached = await redis.get<DbUserResponse[]>(cacheKey);
    const cachedTotal = await redis.get<number>(totalCountKey);
    
    if (cached && cachedTotal !== null) {
      console.log('[Redis HIT] users page:', cursor);
      return {
        data: cached,
        nextCursor: cached.length === limit ? (cursor || 0) + limit : null,
        total: cachedTotal
      };
    }

    console.log('[Redis MISS] Querying database...');
    
    // 获取总数
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    // 获取分页数据
    const result = await db.select()
      .from(users)
      .orderBy(users.id)
      .limit(limit)
      .offset(cursor || 0);

    // 缓存当前页数据和总数
    await Promise.all([
      redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_TTL, nx: true }),
      redis.set(totalCountKey, count, { ex: CACHE_TTL, nx: true })
    ]);

    return {
      data: result,
      nextCursor: result.length === limit ? (cursor || 0) + limit : null,
      total: count
    };
  },

  // 获取所有用户（流式处理）
  async *getAllStream(batchSize: number = 500) {
    const cacheKey = 'neon_all_users:chunks';
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
        const chunkKey = `neon_all_users:chunk:${chunkIndex}`;
        await redis.set(chunkKey, JSON.stringify(currentChunk), { ex: CACHE_TTL });
        chunks.push(chunkKey);
        yield currentChunk;
        
        currentChunk = [];
        chunkIndex++;
      }
    }

    // 处理最后一批数据
    if (currentChunk.length > 0) {
      const chunkKey = `neon_all_users:chunk:${chunkIndex}`;
      await redis.set(chunkKey, JSON.stringify(currentChunk), { ex: CACHE_TTL });
      chunks.push(chunkKey);
      yield currentChunk;
    }

    // 缓存分块信息
    await redis.set(cacheKey, JSON.stringify(chunks), { ex: CACHE_TTL });
  },

  // 获取前100名用户
  async getTopUsers() {
    const cacheKey = 'neon_top_users';
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
    await redis.del('neon_all_users:chunks', 'neon_top_users');
    return result[0];
  },

  // 更新用户
  async update(address: string, data: UpdateUser) {
    const result = await db.update(users)
      .set({ ...data, updated_at: new Date() })
      .where(eq(users.address, address))
      .returning();
    
    // 清除相关缓存
    await redis.del(`user:${address}`, 'neon_all_users:chunks', 'neon_top_users');
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
    await redis.del(`user:${data.address}`, 'neon_all_users:chunks', 'neon_top_users');
    return result[0];
  },

  // 删除用户
  async delete(address: string) {
    const result = await db.delete(users)
      .where(eq(users.address, address))
      .returning();
    
    // 清除相关缓存
    await redis.del(`user:${address}`, 'neon_all_users:chunks', 'neon_top_users');
    return result[0];
  },

  // 获取用户统计数据
  async getStatistics() {
    const cacheKey = 'neon_users:statistics';
    const cached = await redis.get<{
      totalUsers: number;
      totalStamps: number;
      totalPoints: number;
      stampsDistribution: { range: string; count: number }[];
      pointsDistribution: { range: string; count: number }[];
      growthByDay: { date: string; count: number }[];
    }>(cacheKey);
    
    if (cached) {
      console.log('[Redis HIT] users statistics');
      return cached;
    }

    console.log('[Redis MISS] Calculating user statistics...');

    // 获取所有用户数据
    const userData = await db.select({
      points: users.points,
      stamp_count: users.stamp_count,
      created_at: users.created_at
    }).from(users);

    // 计算统计数据
    const statistics = {
      totalUsers: userData.length,
      totalStamps: userData.reduce((sum: number, user: { stamp_count: number | null }) => sum + (user.stamp_count || 0), 0),
      totalPoints: userData.reduce((sum: number, user: { points: number | null }) => sum + (user.points || 0), 0),
      stampsDistribution: calculateStampsDistribution(userData),
      pointsDistribution: calculatePointsDistribution(userData),
      growthByDay: calculateGrowthByDay(userData)
    };

    // 缓存24小时
    await redis.set(cacheKey, JSON.stringify(statistics), { 
      ex: 24 * 3600, // 24 hours in seconds
      nx: true 
    });

    return statistics;
  }
};

// 印章相关操作
export const stampService = {
  // 获取所有印章
  async getAll() {
    const cacheKey = 'neon_stamps';
    const cached = await redis.get<RawStampResponse[]>(cacheKey);
    if (cached) {
      console.log('[Redis HIT] stamps');
      return cached;
    }

    console.log('[Redis MISS] Querying database...');
    const result = await db.select().from(stamps);
    // 移除 nx: true，允许覆盖现有缓存
    await redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_TTL });
    return result;
  },

  // 根据ID获取印章
  async getById(id: string) {
    const cacheKey = `stamp:${id}`;
    const cached = await redis.get<RawStampResponse>(cacheKey);
    
    if (cached) {
      console.log('[Redis HIT] stamp:', id);
      return cached;
    }

    console.log('[Redis MISS] Querying database...');
    const result = await db.select()
      .from(stamps)
      .where(eq(stamps.stamp_id, id));

    if (result[0]) {
      // 移除 nx: true
      await redis.set(cacheKey, JSON.stringify(result[0]), { ex: CACHE_TTL });
    }
    return result[0];
  },

  // 创建印章
  async create(data: NewStamp) {
    const result = await db.insert(stamps).values(data).returning();
    // 清除相关缓存
    await redis.del('neon_stamps');
    return result[0];
  },

  // 更新印章
  async update(id: string, data: UpdateStamp) {
    const result = await db.update(stamps)
      .set({ ...data, updated_at: new Date() })
      .where(eq(stamps.stamp_id, id))
      .returning();
    
    // 修复缓存清除逻辑
    try {
      // 同时清除全局缓存和特定印章缓存
      await Promise.all([
        redis.del('neon_stamps'),
        redis.del(`stamp:${id}`)
      ])
      console.log('[Redis] Successfully cleared cache for stamp:', id);
      
      // 验证缓存是否真的被删除
      const verify = await redis.get('neon_stamps');
      console.log('[Redis] Cache after deletion:', verify ? 'STILL EXISTS' : 'SUCCESSFULLY DELETED');
      
    } catch (error) {
      console.error('[Redis] Error clearing cache:', error);
    }
    
    return result[0];
  },

  // 删除印章
  async delete(id: string) {
    const result = await db.delete(stamps)
      .where(eq(stamps.stamp_id, id))
      .returning();
    
    // 清除相关缓存
    await redis.del(`stamp:${id}`, 'neon_stamps');
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
    await redis.del(`stamp:${id}`, 'neon_stamps');
    return result[0];
  }
}; 