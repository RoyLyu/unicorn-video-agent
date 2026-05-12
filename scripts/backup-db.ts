import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export type BackupDbOptions = {
  cwd?: string;
  dbPath?: string;
  backupDir?: string;
  now?: Date;
};

export function formatBackupTimestamp(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("") + "-" + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join("");
}

export function getBackupDbPaths(options: BackupDbOptions = {}) {
  const cwd = options.cwd ?? process.cwd();
  const dbPath = options.dbPath ?? path.join(cwd, "data", "unicorn-video-agent.sqlite");
  const backupDir = options.backupDir ?? path.join(cwd, "backups");
  const fileName = `unicorn-video-agent-${formatBackupTimestamp(options.now)}.sqlite`;

  return {
    dbPath,
    backupDir,
    backupPath: path.join(backupDir, fileName)
  };
}

export async function backupDatabase(options: BackupDbOptions = {}) {
  const paths = getBackupDbPaths(options);

  try {
    await access(paths.dbPath);
  } catch {
    throw new Error(
      `SQLite database not found at ${paths.dbPath}. Run pnpm db:migrate or restore a backup first.`
    );
  }

  await mkdir(paths.backupDir, { recursive: true });
  await copyFile(paths.dbPath, paths.backupPath);

  return paths;
}

async function main() {
  try {
    const result = await backupDatabase();
    console.log(`SQLite backup created: ${result.backupPath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`backup:db failed: ${message}`);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  void main();
}
