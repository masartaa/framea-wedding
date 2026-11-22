import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Variabel lingkungan DATABASE_URL belum diatur.");
  }

  const sql = neon(databaseUrl);
  return drizzle({ client: sql });
}
