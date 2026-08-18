import { argon2id, argon2Verify } from 'hash-wasm';
import { database } from '@/storage/database';
import type { AuthUser } from '@/types';

type UserRow = {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  salt: string;
  password_algorithm: string;
};

const ARGON2_OPTIONS = {
  iterations: 2,
  parallelism: 1,
  memorySize: 19_456,
  hashLength: 32,
} as const;

function randomHex(size: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
}

function toUser(row: UserRow): AuthUser {
  return { id: row.id, email: row.email, displayName: row.display_name };
}

export async function createAccount(displayName: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await database.query<UserRow>(
    'SELECT id, email, display_name, password_hash, salt, password_algorithm FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail],
  );

  if (existing.length > 0) {
    throw new Error('An account with this email already exists.');
  }

  const salt = randomHex(16);
  const passwordHash = await argon2id({
    password,
    salt,
    ...ARGON2_OPTIONS,
    outputType: 'encoded',
  });
  const id = crypto.randomUUID();

  await database.execute(
    'INSERT INTO users (id, email, display_name, password_hash, salt, password_algorithm, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      normalizedEmail,
      displayName.trim(),
      passwordHash,
      salt,
      'argon2id:m=19456,t=2,p=1',
      new Date().toISOString(),
    ],
  );

  return { id, email: normalizedEmail, displayName: displayName.trim() } satisfies AuthUser;
}

export async function verifyCredentials(email: string, password: string) {
  const rows = await database.query<UserRow>(
    'SELECT id, email, display_name, password_hash, salt, password_algorithm FROM users WHERE email = ? LIMIT 1',
    [email.trim().toLowerCase()],
  );

  const row = rows[0];
  if (!row || !row.password_algorithm.startsWith('argon2id')) return null;

  const matches = await argon2Verify({ password, hash: row.password_hash });
  return matches ? toUser(row) : null;
}

export async function ensureDemoAccount() {
  const email = 'demo@cryptocurrency.app';
  const existing = await database.query<UserRow>(
    'SELECT id, email, display_name, password_hash, salt, password_algorithm FROM users WHERE email = ? LIMIT 1',
    [email],
  );

  if (existing.length === 0) {
    await createAccount('Demo Analyst', email, 'Demo123!');
  }
}
