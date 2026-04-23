import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@db/schema";

const dbPath = process.env.DATABASE_PATH || "/data/data.db";
const client = new Database(dbPath);
client.exec("PRAGMA journal_mode = WAL;");

export const db = drizzle(client, { schema });
