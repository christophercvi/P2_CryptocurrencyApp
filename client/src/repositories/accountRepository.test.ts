import { beforeEach, describe, expect, it, vi } from 'vitest';

const { query, execute, argon2id, argon2Verify } = vi.hoisted(() => ({
  query: vi.fn(),
  execute: vi.fn(),
  argon2id: vi.fn(),
  argon2Verify: vi.fn(),
}));

vi.mock('@/storage/database', () => ({ database: { query, execute } }));
vi.mock('hash-wasm', () => ({ argon2id, argon2Verify }));

import { createAccount, ensureDemoAccount, verifyCredentials } from './accountRepository';

const row = {
  id: 'user-1',
  email: 'analyst@example.com',
  display_name: 'Market Analyst',
  password_hash: '$argon2id$encoded',
  salt: 'aabbcc',
  password_algorithm: 'argon2id:m=19456,t=2,p=1',
};

describe('accountRepository', () => {
  beforeEach(() => {
    query.mockReset();
    execute.mockReset();
    argon2id.mockReset().mockResolvedValue('$argon2id$encoded');
    argon2Verify.mockReset().mockResolvedValue(true);
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000001');
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      (array as Uint8Array).fill(10);
      return array;
    });
  });

  it('creates an account with an encoded Argon2id hash and stored parameters', async () => {
    query.mockResolvedValueOnce([]);

    const user = await createAccount(' Market Analyst ', 'ANALYST@example.com ', 'StrongPass1!');

    expect(argon2id).toHaveBeenCalledWith(expect.objectContaining({
      password: 'StrongPass1!',
      memorySize: 19_456,
      iterations: 2,
      parallelism: 1,
      outputType: 'encoded',
    }));
    expect(execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      expect.arrayContaining(['analyst@example.com', 'Market Analyst', '$argon2id$encoded', 'argon2id:m=19456,t=2,p=1']),
    );
    expect(user).toEqual({
      id: '00000000-0000-4000-8000-000000000001',
      email: 'analyst@example.com',
      displayName: 'Market Analyst',
    });
  });

  it('rejects duplicate accounts before hashing', async () => {
    query.mockResolvedValueOnce([row]);

    await expect(createAccount('Analyst', row.email, 'StrongPass1!')).rejects.toThrow('already exists');
    expect(argon2id).not.toHaveBeenCalled();
  });

  it('verifies an Argon2id account and returns the public session user', async () => {
    query.mockResolvedValueOnce([row]);

    await expect(verifyCredentials(row.email, 'StrongPass1!')).resolves.toEqual({
      id: row.id,
      email: row.email,
      displayName: row.display_name,
    });
    expect(argon2Verify).toHaveBeenCalledWith({ password: 'StrongPass1!', hash: row.password_hash });
  });

  it('rejects unknown, invalid, and unsupported-algorithm credentials', async () => {
    query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ ...row, password_algorithm: 'pbkdf2' }]).mockResolvedValueOnce([row]);
    argon2Verify.mockResolvedValueOnce(false);

    await expect(verifyCredentials('missing@example.com', 'password')).resolves.toBeNull();
    await expect(verifyCredentials(row.email, 'password')).resolves.toBeNull();
    await expect(verifyCredentials(row.email, 'password')).resolves.toBeNull();
  });

  it('creates the demo account only when it is absent', async () => {
    query.mockResolvedValueOnce([row]);
    await ensureDemoAccount();
    expect(execute).not.toHaveBeenCalled();

    query.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    await ensureDemoAccount();
    expect(execute).toHaveBeenCalledOnce();
  });
});
