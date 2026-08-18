import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

type SqlValue = string | number | null | Uint8Array;

type DatabaseRequest = {
  id: number;
  operation: 'init' | 'execute' | 'query';
  sql?: string;
  bind?: SqlValue[];
};

type DatabaseResponse = {
  id: number;
  ok: boolean;
  result?: unknown;
  error?: string;
};

const schema = `
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    password_algorithm TEXT NOT NULL DEFAULT 'argon2id:m=19456,t=2,p=1',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS watchlist (
    user_id TEXT NOT NULL,
    coin_id TEXT NOT NULL,
    coin_name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    image TEXT NOT NULL,
    added_at TEXT NOT NULL,
    alert_enabled INTEGER NOT NULL DEFAULT 0,
    alert_target REAL,
    PRIMARY KEY (user_id, coin_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`;

let databasePromise: Promise<{ db: any; mode: 'opfs' | 'memory' }> | null = null;

async function openDatabase() {
  if (!databasePromise) {
    databasePromise = sqlite3InitModule().then((sqlite3) => {
      let mode: 'opfs' | 'memory' = 'memory';
      let db: any;

      if (globalThis.crossOriginIsolated && typeof sqlite3.oo1.OpfsDb === 'function') {
        db = new sqlite3.oo1.OpfsDb('/cryptocurrencyapp.sqlite3', 'c');
        mode = 'opfs';
      } else {
        db = new sqlite3.oo1.DB(':memory:', 'ct');
      }

      db.exec(schema);
      return { db, mode };
    });
  }

  return databasePromise;
}

self.onmessage = async (event: MessageEvent<DatabaseRequest>) => {
  const request = event.data;

  try {
    const { db, mode } = await openDatabase();
    let result: unknown;

    if (request.operation === 'init') {
      result = { mode };
    } else if (request.operation === 'execute') {
      db.exec({ sql: request.sql ?? '', bind: request.bind ?? [] });
      result = { changes: db.changes(true) };
    } else {
      result = db.exec({
        sql: request.sql ?? '',
        bind: request.bind ?? [],
        rowMode: 'object',
        returnValue: 'resultRows',
      });
    }

    self.postMessage({ id: request.id, ok: true, result } satisfies DatabaseResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SQLite operation failed.';
    self.postMessage({ id: request.id, ok: false, error: message } satisfies DatabaseResponse);
  }
};
