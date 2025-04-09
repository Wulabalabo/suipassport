import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { queryD1 } from "../lib/db";
import { users, stamps } from "../lib/db/schema";
import { sql } from "drizzle-orm";

type MigrationStrategy = 'overwrite' | 'incremental' | 'skip';

interface User {
  address: string;
  name?: string;
  stamp_count: number;
  points: number;
  created_at?: string;
  updated_at?: string;
}

interface DbResponse<T> {
  success: boolean;
  meta: unknown;
  results: T[];
}

interface Stamp {
  stamp_id: string;
  claim_code?: string;
  total_count_limit: number;
  user_count_limit: number;
  claim_count: number;
  claim_code_start_timestamp?: number;
  claim_code_end_timestamp?: number;
  public_claim: boolean;
  created_at?: string;
  updated_at?: string;
}

// Initialize Neon connection
const neonSql = neon(process.env.DATABASE_URL!);
const neonDb = drizzle({ client: neonSql });

// Get migration strategy from command line argument or environment variable
const strategy: MigrationStrategy = (process.argv[2] || process.env.MIGRATION_STRATEGY || 'incremental') as MigrationStrategy;
console.log(`Using migration strategy: ${strategy}`);

// 添加常量配置
const BATCH_SIZE = 1000; // 每批处理的记录数
const MAX_RETRIES = 3;   // 最大重试次数
const RETRY_DELAY = 1000; // 重试延迟（毫秒）

// 添加工具函数
async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 添加重试机制的包装函数
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation after ${delay}ms... (${retries} attempts left)`);
      await sleep(delay);
      return withRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

// 进度显示函数
function showProgress(current: number, total: number, label: string) {
  const percentage = Math.round((current / total) * 100);
  const progress = `[${label}] ${current}/${total} (${percentage}%)`;
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(progress);
}

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  try {
    // Handle format like "2025-03-20 13:43:42"
    const [datePart, timePart] = dateStr.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);
    
    return new Date(year, month - 1, day, hour, minute, second);
  } catch (error) {
    console.error("Failed to parse date:", dateStr, error);
    return null;
  }
}

async function checkExistingData() {
  try {
    const existingUsers = await neonDb.select().from(users);
    const existingStamps = await neonDb.select().from(stamps);
    return {
      hasUsers: existingUsers.length > 0,
      hasStamps: existingStamps.length > 0
    };
  } catch (error) {
    console.error("Failed to check existing data:", error);
    return { hasUsers: false, hasStamps: false };
  }
}

async function clearExistingData() {
  try {
    console.log("Clearing existing data...");
    await neonDb.delete(users);
    await neonDb.delete(stamps);
    console.log("Existing data cleared");
  } catch (error) {
    console.error("Failed to clear existing data:", error);
    throw error;
  }
}

async function verifyData() {
  try {
    // Verify users
    const neonUsers = await neonDb.select().from(users);
    console.log(`Found ${neonUsers.length} users in Neon database`);
    console.log("Users:", neonUsers);

    // Verify stamps
    const neonStamps = await neonDb.select().from(stamps);
    console.log(`Found ${neonStamps.length} stamps in Neon database`);
    console.log("Stamps:", neonStamps);
  } catch (error) {
    console.error("Failed to verify data:", error);
  }
}

async function migrateData() {
  try {
    console.log("Starting migration from D1 to Neon...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL);

    // Check existing data
    const existingData = await checkExistingData();
    if (strategy === 'skip' && (existingData.hasUsers || existingData.hasStamps)) {
      console.log("Target database already contains data. Skipping migration as per strategy.");
      return;
    }

    if (strategy === 'overwrite') {
      await clearExistingData();
    }

    // Test Neon connection
    try {
      const testResult = await neonDb.execute(sql`SELECT 1`);
      console.log("Neon connection test successful:", testResult);
    } catch (error) {
      console.error("Failed to connect to Neon database:", error);
      return;
    }

    // Migrate users
    console.log("\nMigrating users table...");
    const usersResponse = await queryD1<DbResponse<User>>("SELECT * FROM users");
    if (!usersResponse.success || !usersResponse.data) {
      throw new Error(`Failed to fetch users: ${usersResponse.error}`);
    }

    const usersData = usersResponse.data;
    const totalUsers = usersData.results.length;
    console.log(`Found ${totalUsers} users in D1 database`);

    // 获取现有用户（只获取一次）
    const existingUserAddresses = new Set<string>();
    if (strategy === 'incremental') {
      const existingUsers = await neonDb.select({ address: users.address }).from(users);
      existingUsers.forEach(user => existingUserAddresses.add(user.address));
      console.log(`Found ${existingUserAddresses.size} existing users in Neon`);
    }

    // 分批处理用户数据
    let processedUsers = 0;
    for (let i = 0; i < totalUsers; i += BATCH_SIZE) {
      const batch = usersData.results.slice(i, i + BATCH_SIZE);
      const usersToInsert = batch
        .filter(user => user.address && !existingUserAddresses.has(user.address))
        .map(user => ({
          address: user.address,
          name: user.name,
          stamp_count: user.stamp_count,
          points: user.points,
          created_at: parseDate(user.created_at) ?? new Date(),
          updated_at: parseDate(user.updated_at) ?? new Date(),
        }));

      if (usersToInsert.length > 0) {
        await withRetry(async () => {
          await neonDb.insert(users).values(usersToInsert);
        });
      }

      processedUsers += batch.length;
      showProgress(processedUsers, totalUsers, 'Users Migration');
    }
    console.log('\nUsers migration completed!');

    // Migrate stamps
    console.log("\nMigrating stamps table...");
    const stampsResponse = await queryD1<DbResponse<Stamp>>("SELECT * FROM stamps");
    if (!stampsResponse.success || !stampsResponse.data) {
      throw new Error(`Failed to fetch stamps: ${stampsResponse.error}`);
    }

    const stampsData = stampsResponse.data.results;
    const totalStamps = stampsData.length;
    console.log(`Found ${totalStamps} stamps in D1 database`);

    // 获取现有stamps（只获取一次）
    const existingStampIds = new Set<string>();
    if (strategy === 'incremental') {
      const existingStamps = await neonDb.select({ stampId: stamps.stamp_id }).from(stamps);
      existingStamps.forEach(stamp => existingStampIds.add(stamp.stampId));
      console.log(`Found ${existingStampIds.size} existing stamps in Neon`);
    }

    // 分批处理stamps数据
    let processedStamps = 0;
    for (let i = 0; i < totalStamps; i += BATCH_SIZE) {
      const batch = stampsData.slice(i, i + BATCH_SIZE);
      const stampsToInsert = batch
        .filter(stamp => stamp.stamp_id && !existingStampIds.has(stamp.stamp_id))
        .map(stamp => ({
          stamp_id: stamp.stamp_id,
          claim_code: stamp.claim_code,
          total_count_limit: stamp.total_count_limit,
          user_count_limit: stamp.user_count_limit,
          claim_count: stamp.claim_count,
          claim_code_start_timestamp: stamp.claim_code_start_timestamp,
          claim_code_end_timestamp: stamp.claim_code_end_timestamp,
          public_claim: stamp.public_claim,
          created_at: parseDate(stamp.created_at) ?? new Date(),
          updated_at: parseDate(stamp.updated_at) ?? new Date(),
        }));

      if (stampsToInsert.length > 0) {
        await withRetry(async () => {
          await neonDb.insert(stamps).values(stampsToInsert);
        });
      }

      processedStamps += batch.length;
      showProgress(processedStamps, totalStamps, 'Stamps Migration');
    }
    console.log('\nStamps migration completed!');

    // 验证迁移结果
    console.log("\nVerifying migration results...");
    await verifyData();
    
  } catch (error) {
    console.error("\nMigration failed:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
}

// Run the migration
migrateData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 