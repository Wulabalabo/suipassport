import { pgTable, text, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  name: text("name"),
  stamp_count: integer("stamp_count").default(0),
  points: integer("points").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const stamps = pgTable("stamps", {
  id: serial("id").primaryKey(),
  stamp_id: text("stamp_id").notNull(),
  claim_code: text("claim_code"),
  total_count_limit: integer("total_count_limit").default(0),
  user_count_limit: integer("user_count_limit").default(1),
  claim_count: integer("claim_count").default(0),
  claim_code_start_timestamp: integer("claim_code_start_timestamp"),
  claim_code_end_timestamp: integer("claim_code_end_timestamp"),
  public_claim: boolean("public_claim").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  promote_url: text("promote_url")
}); 