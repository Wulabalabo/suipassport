import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

// Initialize Neon connection
const neonSql = neon(process.env.DATABASE_URL!);
const neonDb = drizzle({ client: neonSql });

async function initTables() {
  try {
    console.log("Initializing tables in Neon database...");

    // Create users table
    console.log("Creating users table...");
    await neonDb.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        address TEXT NOT NULL UNIQUE,
        name TEXT,
        stamp_count INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users index
    console.log("Creating users index...");
    await neonDb.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_address ON users(address)
    `);

    // Create stamps table
    console.log("Creating stamps table...");
    await neonDb.execute(sql`
      CREATE TABLE IF NOT EXISTS stamps (
        id SERIAL PRIMARY KEY,
        stamp_id TEXT NOT NULL,
        claim_code TEXT,
        total_count_limit INTEGER DEFAULT 0,
        user_count_limit INTEGER DEFAULT 1,
        claim_count INTEGER DEFAULT 0,
        claim_code_start_timestamp INTEGER,
        claim_code_end_timestamp INTEGER,
        public_claim BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create stamps indexes
    console.log("Creating stamps indexes...");
    await neonDb.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_stamp_id ON stamps(stamp_id)
    `);
    await neonDb.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_claim_code ON stamps(claim_code)
    `);
    await neonDb.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_timestamps ON stamps(claim_code_start_timestamp, claim_code_end_timestamp)
    `);

    console.log("Tables initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize tables:", error);
    throw error;
  }
}

// Run the initialization
initTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 