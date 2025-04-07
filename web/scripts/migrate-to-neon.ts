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

    // // Migrate users table
    console.log("Migrating users table...");
    const usersResponse = await queryD1<DbResponse<User>>("SELECT * FROM users");
    if (!usersResponse.success || !usersResponse.data) {
      console.error("Failed to fetch users:", usersResponse.error);
      return;
    }

    const usersData = usersResponse.data;
    const userCount = usersData.results.length;
    console.log(`Found ${userCount} users in D1 database`);

    if (userCount > 0) {
      for (const user of usersData.results) {
        if (!user.address) {
          console.error(`Skipping user with null address:`, user);
          continue;
        }
        try {
          if (strategy === 'incremental') {
            // Check if user already exists
            const existingUser = await neonDb.select().from(users).where(sql`address = ${user.address}`);
            if (existingUser.length > 0) {
              console.log(`User ${user.address} already exists, skipping`);
              continue;
            }
          }
          await neonDb.insert(users).values({
            address: user.address,
            name: user.name,
            stamp_count: user.stamp_count,
            points: user.points,
            created_at: parseDate(user.created_at) ?? new Date(),
            updated_at: parseDate(user.updated_at) ?? new Date(),
          });
          console.log(`Migrated user: ${user.address}`);
        } catch (error) {
          console.error(`Failed to migrate user ${user.address}:`, error);
          if (error instanceof Error) {
            console.error("Error details:", {
              message: error.message,
              stack: error.stack,
            });
          }
        }
      }
    }

    // Migrate stamps table
    console.log("Migrating stamps table...");
    const stampsResponse = await queryD1<DbResponse<Stamp>>("SELECT * FROM stamps");
    console.log("stampsResponse:", stampsResponse);
    if (!stampsResponse.success || !stampsResponse.data) {
      console.error("Failed to fetch stamps:", stampsResponse.error);
      return;
    }

    const stampsData = stampsResponse.data.results;
    const stampCount = stampsData.length;
    console.log(`Found ${stampCount} stamps in D1 database`);

    if (stampCount > 0) {
      for (const stamp of stampsData) {
        if (!stamp.stamp_id) {
          console.error(`Skipping stamp with null stamp_id:`, stamp.stamp_id);
          continue;
        }
        try {
          if (strategy === 'incremental') {
            // Check if stamp already exists
            const existingStamp = await neonDb.select().from(stamps).where(sql`stamp_id = ${stamp.stamp_id}`);
            if (existingStamp.length > 0) {
              console.log(`Stamp ${stamp.stamp_id} already exists, skipping`);
              continue;
            }
          }
          await neonDb.insert(stamps).values({
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
          });
          console.log(`Migrated stamp: ${stamp.stamp_id}`);
        } catch (error) {
          console.error(`Failed to migrate stamp ${stamp.stamp_id}:`, error);
          console.error("Stamp data:", stamp);
          if (error instanceof Error) {
            console.error("Error details:", {
              message: error.message,
              stack: error.stack,
            });
          }
        }
      }
    }

    console.log("Migration completed!");
    
    // Verify the data after migration
    console.log("\nVerifying data in Neon database...");
    await verifyData();
  } catch (error) {
    console.error("Migration failed:", error);
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