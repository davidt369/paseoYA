import '@angular/compiler';

// In-memory mock for localStorage in test environment
const storage: Record<string, string> = {};

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = String(value);
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      for (const k of Object.keys(storage)) {
        delete storage[k];
      }
    },
    key: (i: number) => Object.keys(storage)[i] ?? null,
    get length() {
      return Object.keys(storage).length;
    },
  };
}
