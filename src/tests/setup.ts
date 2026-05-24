import "@testing-library/jest-dom";

// Zustand persist middleware needs a working localStorage.
// jsdom provides one but it can be flaky; override to be safe.
const store: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (key: string) => key in store ? store[key] : null,
  setItem: (key: string, value: string) => { store[key] = String(value); },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  key: (index: number) => Object.keys(store)[index] ?? null,
  get length() { return Object.keys(store).length; },
};

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });
