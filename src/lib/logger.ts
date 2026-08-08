// Production-safe logger: no-ops in production to avoid leaking internal state
// to browser devtools or server logs. Use instead of console.* throughout the app.
const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  error: (...args: unknown[]) => {
    if (isDev) console.error(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
};
