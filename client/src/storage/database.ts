import type { StorageMode } from '@/types';

type SqlValue = string | number | null | Uint8Array;

type DatabaseResponse = {
  id: number;
  ok: boolean;
  result?: unknown;
  error?: string;
};

class DatabaseClient {
  private worker: Worker | null = null;
  private requestId = 0;
  private pending = new Map<
    number,
    { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }
  >();
  private ready: Promise<StorageMode> | null = null;

  initialize(): Promise<StorageMode> {
    if (!this.ready) {
      this.worker = new Worker(new URL('./sqlite.worker.ts', import.meta.url), { type: 'module' });
      this.worker.addEventListener('message', this.handleMessage);
      this.ready = this.request<{ mode: StorageMode }>('init').then((result) => result.mode);
    }

    return this.ready;
  }

  async execute(sql: string, bind: SqlValue[] = []) {
    await this.initialize();
    return this.request<{ changes: number }>('execute', sql, bind);
  }

  async query<T extends Record<string, unknown>>(sql: string, bind: SqlValue[] = []) {
    await this.initialize();
    return this.request<T[]>('query', sql, bind);
  }

  private handleMessage = (event: MessageEvent<DatabaseResponse>) => {
    const pendingRequest = this.pending.get(event.data.id);
    if (!pendingRequest) return;

    this.pending.delete(event.data.id);
    if (event.data.ok) {
      pendingRequest.resolve(event.data.result);
    } else {
      pendingRequest.reject(new Error(event.data.error ?? 'Database request failed.'));
    }
  };

  private request<T>(operation: 'init' | 'execute' | 'query', sql?: string, bind?: SqlValue[]) {
    if (!this.worker && operation !== 'init') {
      throw new Error('Database worker is unavailable.');
    }

    if (!this.worker) {
      this.worker = new Worker(new URL('./sqlite.worker.ts', import.meta.url), { type: 'module' });
      this.worker.addEventListener('message', this.handleMessage);
    }

    const id = ++this.requestId;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, {
        resolve: (value) => resolve(value as T),
        reject,
      });
      this.worker?.postMessage({ id, operation, sql, bind });
    });
  }
}

export const database = new DatabaseClient();
