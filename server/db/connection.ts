import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL as string,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize Drizzle with the pool and schema
export const db = drizzle(pool, { schema });

// Export the pool for raw queries if needed
export { pool };
