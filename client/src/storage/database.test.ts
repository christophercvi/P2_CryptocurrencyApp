import { beforeEach, describe, expect, it, vi } from 'vitest';

type Listener = (event: MessageEvent) => void;

class WorkerMock {
  static instances: WorkerMock[] = [];
  listener: Listener | null = null;
  postMessage = vi.fn();

  constructor() {
    WorkerMock.instances.push(this);
  }

  addEventListener(_name: string, listener: EventListenerOrEventListenerObject) {
    this.listener = listener as Listener;
  }

  respond(data: unknown) {
    this.listener?.({ data } as MessageEvent);
  }
}

async function loadDatabase() {
  vi.resetModules();
  vi.stubGlobal('Worker', WorkerMock);
  return (await import('./database')).database;
}

describe('DatabaseClient', () => {
  beforeEach(() => {
    WorkerMock.instances = [];
  });

  it('initializes once and returns the worker storage mode', async () => {
    const database = await loadDatabase();
    const pending = database.initialize();
    const worker = WorkerMock.instances[0];
    expect(worker.postMessage).toHaveBeenCalledWith({ id: 1, operation: 'init', sql: undefined, bind: undefined });
    worker.respond({ id: 1, ok: true, result: { mode: 'opfs' } });
    await expect(pending).resolves.toBe('opfs');
    await expect(database.initialize()).resolves.toBe('opfs');
    expect(WorkerMock.instances).toHaveLength(1);
  });

  it('sends execute and query operations after initialization', async () => {
    const database = await loadDatabase();
    const ready = database.initialize();
    const worker = WorkerMock.instances[0];
    worker.respond({ id: 1, ok: true, result: { mode: 'memory' } });
    await ready;

    const execute = database.execute('UPDATE watchlist SET alert_enabled = ?', [1]);
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenLastCalledWith({ id: 2, operation: 'execute', sql: 'UPDATE watchlist SET alert_enabled = ?', bind: [1] }));
    worker.respond({ id: 2, ok: true, result: { changes: 1 } });
    await expect(execute).resolves.toEqual({ changes: 1 });

    const query = database.query<{ id: string }>('SELECT id FROM users');
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenLastCalledWith({ id: 3, operation: 'query', sql: 'SELECT id FROM users', bind: [] }));
    worker.respond({ id: 3, ok: true, result: [{ id: 'user-1' }] });
    await expect(query).resolves.toEqual([{ id: 'user-1' }]);
  });

  it('rejects worker failures with a normalized Error', async () => {
    const database = await loadDatabase();
    const pending = database.initialize();
    WorkerMock.instances[0].respond({ id: 1, ok: false, error: 'OPFS unavailable' });
    await expect(pending).rejects.toThrow('OPFS unavailable');
  });
});
