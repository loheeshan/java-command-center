/**
 * Versioned local-first persistence. The app talks to a StorageAdapter, so a server/database
 * adapter can replace localStorage later without touching learning modules.
 */
export interface StorageAdapter {
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
}

export const localStorageAdapter: StorageAdapter = {
  read: (k) => {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  write: (k, v) => {
    try {
      window.localStorage.setItem(k, v);
    } catch {
      /* quota or privacy mode: progress stays in memory for this session */
    }
  },
  remove: (k) => {
    try {
      window.localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};

export function memoryAdapter(): StorageAdapter {
  const m = new Map<string, string>();
  return { read: (k) => m.get(k) ?? null, write: (k, v) => void m.set(k, v), remove: (k) => void m.delete(k) };
}

interface Envelope<T> {
  version: number;
  savedAt: number;
  data: T;
}

export type Migration = (data: unknown) => unknown;

export class VersionedStore<T> {
  constructor(
    private readonly adapter: StorageAdapter,
    private readonly key: string,
    private readonly version: number,
    private readonly fallback: () => T,
    /** migrations[n] upgrades data from version n to n+1 */
    private readonly migrations: Record<number, Migration> = {},
  ) {}

  load(): T {
    const raw = this.adapter.read(this.key);
    if (!raw) return this.fallback();
    try {
      const env = JSON.parse(raw) as Envelope<unknown>;
      let data = env.data;
      for (let v = env.version; v < this.version; v++) {
        const mig = this.migrations[v];
        if (!mig) return this.fallback();
        data = mig(data);
      }
      return { ...this.fallback(), ...(data as T) };
    } catch {
      return this.fallback();
    }
  }

  save(data: T) {
    const env: Envelope<T> = { version: this.version, savedAt: Date.now(), data };
    this.adapter.write(this.key, JSON.stringify(env));
  }

  clear() {
    this.adapter.remove(this.key);
  }
}
