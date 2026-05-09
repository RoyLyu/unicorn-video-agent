import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import * as schema from "./schema";

export const DATABASE_FILE_PATH = join(
  process.cwd(),
  "data",
  "unicorn-video-agent.sqlite"
);

export type DbClient = {
  db: BetterSQLite3Database<typeof schema>;
  sqlite: Database.Database;
  close: () => void;
};

let defaultClient: DbClient | null = null;

export function createDbClient(databasePath = DATABASE_FILE_PATH): DbClient {
  if (databasePath !== ":memory:") {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  const sqlite = new Database(databasePath);
  sqlite.pragma("foreign_keys = ON");

  return {
    db: drizzle(sqlite, { schema }),
    sqlite,
    close: () => sqlite.close()
  };
}

export function getDbClient() {
  defaultClient ??= createDbClient();

  return defaultClient;
}
