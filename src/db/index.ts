import { createClient, type Client } from '@libsql/client';
import path from 'path';
import { pathToFileURL } from 'url';

const globalForDb = globalThis as unknown as {
  _libsql?: Client;
  _schemaPromise?: Promise<void>;
};

function getDatabaseUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  const filePath = path.join(process.cwd(), 'data', 'deepfake-kiosk.db');
  return pathToFileURL(filePath).href;
}

function createClientSingleton(): Client {
  return createClient({
    url: getDatabaseUrl(),
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export function getClient(): Client {
  if (!globalForDb._libsql) {
    globalForDb._libsql = createClientSingleton();
  }
  return globalForDb._libsql;
}

async function initSchema(client: Client): Promise<void> {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      real_image TEXT NOT NULL,
      fake_image TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      image_kind TEXT NOT NULL DEFAULT 'ai'
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      answers TEXT NOT NULL DEFAULT '[]',
      duration_ms INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      session_id TEXT NOT NULL
    )
  `);

  const info = await client.execute('PRAGMA table_info(scores)');
  const nameCol = info.columns.indexOf('name');
  const hasDuration =
    nameCol >= 0 &&
    info.rows.some((row) => row[nameCol] === 'duration_ms');
  if (!hasDuration) {
    await client.execute('ALTER TABLE scores ADD COLUMN duration_ms INTEGER');
  }

  const imgInfo = await client.execute('PRAGMA table_info(images)');
  const imgNameColIdx = imgInfo.columns.indexOf('name');
  const hasImageKind =
    imgNameColIdx >= 0 &&
    imgInfo.rows.some(
      (row) => String(row[imgNameColIdx]) === 'image_kind'
    );
  if (!hasImageKind) {
    await client.execute(
      "ALTER TABLE images ADD COLUMN image_kind TEXT NOT NULL DEFAULT 'ai'"
    );
  }
}

export async function ensureDb(): Promise<Client> {
  const client = getClient();
  if (!globalForDb._schemaPromise) {
    globalForDb._schemaPromise = initSchema(client);
  }
  await globalForDb._schemaPromise;
  return client;
}
